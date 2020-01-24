const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const Actualite = mongoose.model("actualites");
const User = mongoose.model("users");
const { ensureAuthenticated, checkGrant } = require("../helpers/functions");

let permission;

//Load Keys
const keys = require("../config/keys");

// Cloudinary Config
cloudinary.config({
  cloud_name: keys.cloudinaryName,
  api_key: keys.cloudinaryApiKey,
  api_secret: keys.cloudinaryApiSecret
});

//Create Storage engine
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "actualites",
  allowedFormats: ["jpg", "jpeg", "png"]
  // transformation: [{ width: 500, height: 500, gravity: "face", crop: "thumb" }]
});
const upload = multer({ storage });

router.get("/", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "actualite", req, res);
  if (permission) {
    Actualite.find()
      .sort({ date_publication: "asc" })
      .then(actualites => {
        res.render("actualites/index", {
          actualites: actualites
        });
      });
  }
});

router.get("/add", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "actualite", req, res);
  if (permission) {
    res.render("actualites/add");
  }
});

router.post(
  "/add",
  upload.single("image_actu"),
  ensureAuthenticated,
  (req, res) => {
    permission = checkGrant(
      req.user.statut,
      "createAny",
      "actualite",
      req,
      res
    );
    if (permission) {
      let errors = [];

      if (!req.body.titre) {
        errors.push({
          text: "Veuillez saisir un titre pour l'actualité"
        });
      }

      if (!req.body.commentaire) {
        errors.push({
          text: "Veuillez rentrer le texte de cette actualité"
        });
      }

      if (errors.length > 0) {
        if (req.file) {
          cloudinary.v2.uploader.destroy(req.file.public_id);
        }
        res.render("actualites/add", {
          errors: errors,
          titre: req.body.titre,
          image: req.file,
          texte: req.body.commentaire
        });
      } else {
        let newActualite = {};
        if (req.file) {
          newActualite = {
            titre: req.body.titre.toUpperCase(),
            texte: req.body.commentaire,
            image: {
              id: req.file.public_id,
              url: req.file.url,
              format: req.file.format
            },
            date_publication: new Date()
          };
        } else {
          newActualite = {
            titre: req.body.titre.toUpperCase(),
            texte: req.body.commentaire,
            date_publication: new Date()
          };
        }

        new Actualite(newActualite).save().then(() => {
          req.flash("success_msg", "Nouvelle actualité ajoutée");
          res.redirect("/actualites");
        });
      }
    }
  }
);

// To Check, Already Done. Create corresponding pages
router.get("/show/:id", (req, res) => {
    Actualite.findOne({
      _id: req.params.id
    }).then(actualite => {
      res.render("actualites/show", {
        actualite: actualite
      });
    });
});

router.get("/showall", (req, res) => {
  Actualite
  .find()
  .sort({ date_publication: "desc" })
  .then(actualites => {
    res.render("actualites/showall", {
      actualites: actualites
    });
  });
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "updateAny", "actualite", req, res);
  if (permission) {
    Actualite.findOne({
      _id: req.params.id
    }).then(actualite => {
      res.render("actualites/edit", {
        actualite: actualite
      });
    });
  }
});

router.put(
  "/edit/:id",
  upload.single("image_actu"),
  ensureAuthenticated,
  (req, res) => {
    Actualite.findOne({
      _id: req.params.id
    }).then(actualite => {
      permission = checkGrant(
        req.user.statut,
        "updateAny",
        "actualite",
        req,
        res
      );
      if (permission) {
        let errors = [];

        if (!req.body.titre) {
          errors.push({
            text: "Veuillez saisir un titre pour l'actualité"
          });
        }

        if (!req.body.commentaire) {
          errors.push({
            text: "Veuillez rentrer le texte de cette actualité"
          });
        }

        if (errors.length > 0) {
          if (req.file) {
            cloudinary.v2.uploader.destroy(req.file.public_id);
          }
          res.render("actualites/edit", {
            errors: errors,
            actualite: actualite,
            titre: req.body.titre,
            image: req.file,
            texte: req.body.commentaire
          });
        } else {
          actualite.titre = req.body.titre.toUpperCase();
          actualite.texte = req.body.commentaire;
          actualite.date_publication = new Date();
          if (req.file) {
            cloudinary.v2.uploader.destroy(actualite.image.id);
            actualite.image.id = req.file.public_id;
            actualite.image.url = req.file.url;
            actualite.image.format = req.file.format;
          }
          actualite.save().then(() => {
            req.flash("success_msg", "Modifications effectuées avec succès");
            res.redirect("/actualites");
          });
        }
      }
    });
  }
);

router.delete("/delete/:id", ensureAuthenticated, (req, res) => {
  Actualite.findOne({
    _id: req.params.id
  }).then(actualite => {
    permission = checkGrant(
      req.user.statut,
      "deleteAny",
      "actualite",
      req,
      res
    );
    if (permission) {
      cloudinary.v2.uploader.destroy(actualite.image.id);
      Actualite.deleteOne({
        _id: req.params.id
      }).then(() => {
        req.flash("success_msg", "Actualité supprimée");
        res.redirect("/actualites");
      });
    }
  });
});
module.exports = router;
