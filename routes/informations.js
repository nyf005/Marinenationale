const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const Information = mongoose.model("informations");
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
  folder: "informations",
  allowedFormats: ["jpg", "jpeg", "png"]
  // transformation: [{ width: 500, height: 500, gravity: "face", crop: "thumb" }]
});
const upload = multer({ storage });

router.get("/", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "readAny", "information", req, res);
  if (permission) {
    Information.find()
      .sort({ date_ajout: "desc" })
      .then(informations => {
        res.render("informations/index", {
          informations: informations
        });
      });
  }
});

router.get("/add", ensureAuthenticated, (req, res) => {
  permission = checkGrant(
    req.user.statut,
    "createAny",
    "information",
    req,
    res
  );
  if (permission) {
    res.render("informations/add");
  }
});

router.post(
  "/add",
  upload.single("image_info"),
  ensureAuthenticated,
  (req, res) => {
    permission = checkGrant(
      req.user.statut,
      "createAny",
      "information",
      req,
      res
    );
    if (permission) {
      let errors = [];

      if (!req.body.reference) {
        errors.push({
          text: "Veuillez saisir la référence de l'information"
        });
      }

      if (!req.body.objet) {
        errors.push({
          text: "Veuillez saisir l'objet de l'information"
        });
      }

      if (!req.file) {
        errors.push({
          text:
            "Veuillez rentrer la copie scannée du message ou de la note qui justifie l'information"
        });
      }

      if (errors.length > 0) {
        if (req.file) {
          cloudinary.v2.uploader.destroy(req.file.public_id);
        }
        res.render("informations/add", {
          errors: errors,
          reference: req.body.reference,
          objet: req.body.objet,
          image: req.file,
          commentaire: req.body.commentaire
        });
      } else {
        const newInformation = {
          reference: req.body.reference.toUpperCase(),
          objet: req.body.objet.toUpperCase(),
          commentaire: req.body.commentaire,
          image: {
            id: req.file.public_id,
            url: req.file.url,
            format: req.file.format
          },
          date_ajout: new Date()
        };

        new Information(newInformation).save().then(information => {
          req.flash("success_msg", "Nouvelle information ajoutée");
          res.redirect("/informations");
        });
      }
    }
  }
);

router.get("/show/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "readAny", "information", req, res);
  if (permission) {
    Information.findOne({
      _id: req.params.id
    }).then(information => {
      res.render("informations/show", {
        information: information
      });
    });
  }
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(
    req.user.statut,
    "updateAny",
    "information",
    req,
    res
  );
  if (permission) {
    Information.findOne({
      _id: req.params.id
    }).then(information => {
      res.render("informations/edit", {
        information: information
      });
    });
  }
});

router.put(
  "/edit/:id",
  upload.single("image_info"),
  ensureAuthenticated,
  (req, res) => {
    permission = checkGrant(
      req.user.statut,
      "updateAny",
      "information",
      req,
      res
    );
    if (permission) {
      let errors = [];

      if (!req.body.reference) {
        errors.push({
          text: "Veuillez saisir la référence de l'information"
        });
      }

      if (!req.body.objet) {
        errors.push({
          text: "Veuillez saisir l'objet de l'information"
        });
      }

      if (errors.length > 0) {
        if (req.file) {
          cloudinary.v2.uploader.destroy(req.file.public_id);
        }
        res.render("informations/edit", {
          errors: errors,
          reference: req.body.reference,
          objet: req.body.objet,
          image: req.file,
          commentaire: req.body.commentaire
        });
      } else {
        Information.findOne({
          _id: req.params.id
        }).then(information => {
          information.reference = req.body.reference.toUpperCase();
          information.objet = req.body.objet.toUpperCase();
          information.commentaire = req.body.commentaire;
          if (req.file) {
            cloudinary.v2.uploader.destroy(information.image.id);
            information.image.id = req.file.public_id;
            information.image.url = req.file.url;
            information.image.format = req.file.format;
          }
          information.save().then(() => {
            req.flash("success_msg", "Modifications effectuées avec succès");
            res.redirect("/informations");
          });
        });
      }
    }
  }
);

router.delete("/delete/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(
    req.user.statut,
    "deleteAny",
    "information",
    req,
    res
  );
  if (permission) {
    Information.deleteOne({
      _id: req.params.id
    }).then(() => {
      req.flash("success_msg", "Information suprrimée");
      res.redirect("/informations");
    });
  }
});
module.exports = router;
