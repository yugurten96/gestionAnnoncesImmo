var express = require('express');
var router = express.Router();
var Annonce = require('../models/annonce');
var middleware = require('../middleware');
var Review = require('../models/review');
var Comment = require('../models/comment');
var Message = require('../models/message');

// Multer/Cloudinary
var multer = require('multer');

// Multer setup
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var imageFilter = function(req, file, cb) {
	// accepter que les images
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Que les fichiers image sont autorisés!'), false);
	}
	cb(null, true);
};

var cloudinary = require('cloudinary');
cloudinary.config({
	cloud_name: 'dajeg1r6h',
	api_key: 152352994553188,
	api_secret: '-bVk1M89N4tQ_rS-nSepQ5amK4Y'
});

var upload = multer({ storage: storage });


async function uploadToCloudinary(locaFilePath) {

  var mainFolderName = "main";
  var filePathOnCloudinary =
    mainFolderName + "/" + locaFilePath;

  return cloudinary.uploader
    .upload(locaFilePath, { public_id: filePathOnCloudinary })
    .then((result) => {


      return {
        message: "Success",
        url: result.url,
        id: result.public_id,
      };
    })
    .catch((error) => {

      fs.unlinkSync(locaFilePath);
      return { message: "Fail" };
    });
}

//INDEX - Toutes les annonces
router.get('/', function(req, res) {
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	if (req.query.search) {

		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Annonce.find({
			$or: [
				{
					name: regex
				},
				{
					location: regex
				}
			]
		})
			.skip(perPage * pageNumber - perPage)
			.limit(perPage)
			.exec(function(err, allAnnonces) {
				Annonce.count({
					name: regex
				}).exec(function(err, count) {
					if (err) {
						req.flash('error', err.message);
						res.redirect('back');
					} else {

						if (allAnnonces.length < 1) {
							req.flash(
								'error',
								'Aucun bien correspond à votre recherche, Réessayez svp.'
							);
							return res.redirect('back');
						}
						res.render('annonces/index', {
							annonces: allAnnonces,
							current: pageNumber,
							pages: Math.ceil(count / perPage),
							search: req.query.search
						});
					}
				});
			});
	} else {
		// Toutes les annonces à partir de la base de données
		Annonce.find({})
			.skip(perPage * pageNumber - perPage)
			.limit(perPage)
			.exec(function(err, allAnnonces) {
				Annonce.count().exec(function(err, count) {
					if (err) {
						console.log(err);
					} else {
						res.render('annonces/index', {
							annonces: allAnnonces,
							current: pageNumber,
							pages: Math.ceil(count / perPage),
							search: false
						});
					}
				});
			});
	}
});


// CREATE - Ajouter une nouvelle annonces à la base de données
router.post('/', middleware.checkAdminAgent , upload.array("image",10),async (req, res,next)  => {

  var imageUrlList = [];
  var imageIdList = [];

  for (var i = 0; i < req.files.length; i++) {
    var locaFilePath = req.files[i].path;
    var result = await uploadToCloudinary(locaFilePath);
    imageUrlList.push(result.url);
    imageIdList.push(result.id);

  }

    req.body.annonce.image = imageUrlList;
    req.body.annonce.imageId = imageIdList;
    req.body.annonce.author = {
			id: req.user._id,
			username: req.user.username
		};
		Annonce.create(req.body.annonce, function(err, annonce) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			res.redirect('/annonces/' + annonce._id);
		});

});

// NEW - formulaire de création de l'annonce
router.get('/new', middleware.checkAdminAgent, (req, res) => {
	res.render('annonces/new');
});

// SHOW - plus d'infos sur l'annonce
router.get('/:id', (req, res) => {
	// Find annonce with provided ID
	Annonce.findById(req.params.id)
		.populate('comments messages likes')
		.populate({
			path: 'reviews',
			options: {
				sort: {
					createdAt: -1
				}
			}
		})
		.exec(function(err, foundAnnonce) {
			if (err || !foundAnnonce) {
				req.flash('error', 'Bien non trouvé');
				res.redirect('back');
			} else {
				console.log(foundAnnonce);
				//render show template with that annonce
				res.render('annonces/show', {
					annonce: foundAnnonce
				});
			}
		});
});

// EDIT ANNONCE ROUTE
router.get('/:id/edit', middleware.checkAdminAgent, (req, res) => {
	Annonce.findById(req.params.id, (err, foundAnnonce) => {
		res.render('annonces/edit', {
			annonce: foundAnnonce
		});
	});
});

// UPDATE ANNONCE ROUTE
router.put('/:id',middleware.checkAdminAgent, upload.array('image',10),
	(req, res) => {

    var imageUrlList = [];
    var imageIdList = [];
		Annonce.findById(req.params.id, async function(err, annonce) {


			if (err) {
				req.flash('error', err.message);
				res.redirect('back');
			} else {
				if (req.files) {
					try {

            for (var i = 0; i < req.files.length; i++) {
              var locaFilePath = req.files[i].path;
              var result = await uploadToCloudinary(locaFilePath);
              imageUrlList.push(result.url);
              imageIdList.push(result.id);

            }

					} catch (err) {
						req.flash('error', err.message);
						return res.redirect('back');
					}
				}
        annonce.imageId = imageIdList ;
        annonce.image = imageUrlList;
				annonce.name = req.body.name;
				annonce.description = req.body.description;
        annonce.price = req.body.price;
        annonce.type = req.body.type;
        annonce.status = req.body.status;
        annonce.publication = req.body.publication;
        annonce.location = req.body.location;
				annonce.save();
				req.flash('success', 'Mise à jour réussie!');
				res.redirect('/annonces');
			}
		});
	}
);

// DESTROY ANNONCE ROUTE
router.delete('/:id', middleware.checkAdminAgent, function(req, res) {
	Annonce.findById(req.params.id, function(err, annonce) {
		if (err) {
			res.redirect('/annonces');
		} else {
			// deletes all comments associated with the annonce
			Comment.remove(
				{
					_id: {
						$in: annonce.comments
					}
				},
				function(err) {
					if (err) {
						console.log(err);
						return res.redirect('/annonces');
					}
					// deletes all reviews associated with the annonce
					Review.remove(
						{
							_id: {
								$in: annonce.reviews
							}
						},

						function(err) {
							if (err) {
								console.log(err);
								return res.redirect('/annonces');
							}
							//  delete the annonce
							annonce.remove();
							req.flash('success', 'Annonce supprimée avec succès !');
							res.redirect('/annonces');
						}
					);
				}
			);
		}
	});
});

// Annonce Like Route
router.post('/:id/like', middleware.isLoggedIn, function(req, res) {
	Annonce.findById(req.params.id, function(err, foundAnnonce) {
		if (err) {
			console.log(err);
			return res.redirect('/annonces');
		}

		var foundUserLike = foundAnnonce.likes.some(function(like) {
			return like.equals(req.user._id);
		});
		if (foundUserLike) {

			foundAnnonce.likes.pull(req.user._id);
		} else {

			foundAnnonce.likes.push(req.user);
		}

		foundAnnonce.save(function(err) {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('/annonces');
			}
			return res.redirect('/annonces/' + foundAnnonce._id);
		});
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
