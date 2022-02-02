var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Annonce = require("../models/annonce");
var Review = require("../models/review");
var middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Annonce.findById(req.params.id).populate({
        path: "reviews",
        options: {
            sort: {
                createdAt: -1
            }
        }
    }).exec(function (err, annonce) {
        if (err || !annonce) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {
            annonce: annonce
        });
    });
});

// Reviews New (nouvelle évaluation)
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    Annonce.findById(req.params.id, function (err, annonce) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {
            annonce: annonce
        });

    });
});

// Reviews Create (création d'une évaluation)
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    Annonce.findById(req.params.id).populate("reviews").exec(function (err, annonce) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.annonce = annonce;
            review.save();
            annonce.reviews.push(review);
            annonce.rating = calculateAverage(annonce.reviews);
            annonce.save();
            req.flash("success", "Votre évaluation a bien été ajoutée.");
            res.redirect('/annonces/' + annonce._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {
            annonce_id: req.params.id,
            review: foundReview
        });
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {
        new: true
    }, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Annonce.findById(req.params.id).populate("reviews").exec(function (err, annonce) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            annonce.rating = calculateAverage(annonce.reviews);
            annonce.save();
            req.flash("success", "Votre évaluation a bien été mise à jour.");
            res.redirect('/annonces/' + annonce._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Annonce.findByIdAndUpdate(req.params.id, {
            $pull: {
                reviews: req.params.review_id
            }
        }, {
            new: true
        }).populate("reviews").exec(function (err, annonce) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            annonce.rating = calculateAverage(annonce.reviews);
            annonce.save();
            req.flash("success", "Votre évaluation a bien été supprimée.");
            res.redirect("/annonces/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;
