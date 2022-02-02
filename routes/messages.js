var express = require("express");
var router = express.Router({
  mergeParams: true
});
var Annonce = require("../models/annonce");
var Message = require("../models/message");
var middleware = require("../middleware");


// MESSAGES ROUTES
// =====================
// messagess new
router.get("/new", middleware.isLoggedIn, (req, res) => {
  // find annonce by id
  Annonce.findById(req.params.id, (err, annonce) => {
    if (err) {
      req.flash("error", err.message);
      console.log(err);
    } else {
      res.render("message/new", {
        annonce: annonce
      });
    }
  })
})

// Création de message
router.post("/", middleware.isLoggedIn, (req, res) => {
  Annonce.findById(req.params.id, (err, annonce) => {
    if (err) {
      req.flash("error", "Message non trouvé");
      res.redirect("/annonces");
    } else {
      Message.create(req.body.message, (err, message) => {
        if (err) {
          console.log(err);
          req.flash("error", err.message);
        } else {
          message.author.id = req.user._id;
          message.author.username = req.user.username;
          message.save();
          annonce.messages.push(message);
          annonce.save();
          req.flash("success", "Message envoyé avec succès");
          res.redirect("/annonces/" + annonce._id);
        }
      })
    }
  })
})

// MESSAGE EDIT ROUTE
router.get("/:message_id/edit", middleware.checkMessageOwnership, (req, res) => {
  Annonce.findById(req.params.id, (err, foundAnnonce) => {
    if (err || !foundAnnonce) {
      req.flash("error", "Pas d'annonces trouvées");
      return res.redirect("back");
    }
    Message.findById(req.params.message_id, (err, foundMessage) => {
      if (err) {
        res.redirect("back");
      } else {
        res.render("messages/edit", {
          annonce_id: req.params.id,
          message: foundMessage
        });
      }
    });
  });
});

// MESSAGE UPDATE ROUTE
router.put("/:message_id", middleware.checkMessageOwnership, (req, res) => {
  Message.findByIdAndUpdate(req.params.message_id, req.body.message, (err, updatedMessage) => {
    if (err) {
      res.redirect("back");
      req.flash("error", err.message);
    } else {
      res.redirect("/annonces/" + req.params.id);
    }
  })
});

// DESTROY MESSAGE ROUTE
router.delete("/:message_id", middleware.checkMessageOwnership, (req, res) => {
  Message.findByIdAndRemove(req.params.message_id, (err) => {
    if (err) {
      res.redirect("back");
      req.flash("error", err.message);
    } else {
      req.flash("success", "Message supprimé");
      res.redirect("/annonces/" + req.params.id);
    }
  })
});


module.exports = router;
