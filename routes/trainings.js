const express = require("express");
const moment = require("moment");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const Training = mongoose.model("trainings");
const User = mongoose.model("users");
const {
  ensureAuthenticated,
  checkGrant,
  toTitleCase
} = require("../helpers/functions");

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
  folder: "usersDiplomes",
  allowedFormats: ["jpg", "jpeg", "png"]
  // transformation: [{ width: 500, height: 500, gravity: "face", crop: "thumb" }]
});
const upload = multer({ storage });

// Liste des formations
router.get("/", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "readOwn", "training", req, res);
  if (permission) {
    Training.find({
      user: req.user.id
    })
    .sort({date_fin: "desc"})
    .then(trainings => {
      if (trainings) {
        let niveau;
        if (trainings.equivalent == "EDG") {
          niveau = "Ecole de Guerre";
          res.render("trainings/index", {
            trainings: trainings,
            niveau: niveau
          });
        } else {
          res.render("trainings/index", {
            trainings: trainings
          });
        }
      } else {
        res.render("trainings/index");
      }
    });
  }
});

// Formulaire d'ajout de formation
router.get("/add", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createOwn", "training", req, res);
  if (permission) {
    res.render("trainings/add");
  }
});

// Traitement du formulaire d'ajout de formation
router.post("/add", upload.single("scan_diplome"), (req, res) => {
  permission = checkGrant(req.user.statut, "createOwn", "training", req, res);
  if (permission) {
    let errors = [];

    if (!req.body.niveau) {
      errors.push({
        text: "Veuillez sélectionner le niveau de votre stage"
      });
    }

    if (!req.body.intitule) {
      errors.push({
        text: "Veuillez entrer l'intitulé de votre stage ou formation"
      });
    }

    if (!req.body.ecole) {
      errors.push({
        text:
          "Veuillez entrer l'école ou vous avez effectué votre stage ou formation"
      });
    }
    if (!req.body.ville) {
      errors.push({
        text:
          "Veuillez entrer la ville dans laquelle vous avez effectué votre stage ou formation"
      });
    }
    if (!req.body.pays) {
      errors.push({
        text:
          "Veuillez entrer lepays dans lequel vous avez effectué votre stage ou formation"
      });
    }

    if (!req.body.date_debut) {
      errors.push({
        text: "Veuillez entrer la date de début de votre stage ou formation"
      });
    }

    if (!req.body.date_fin) {
      errors.push({
        text: "Veuillez entrer la date de fin de votre stage ou formation"
      });
    }

    if (moment(req.body.date_fin).isBefore(req.body.date_debut)) {
      errors.push({
        text:
          "La date de fin ne peut pas être inférieure à la date de début de votre stage ou formation"
      });
    }

    if (!req.file) {
      errors.push({
        text:
          "Veuillez ajouter une copie scannée du diplome obtenu lors de votre stage ou formation"
      });
    }

    if (errors.length > 0) {
      cloudinary.v2.uploader.destroy(req.file.public_id);
      res.render("trainings/add", {
        errors: errors
      });
    } else {
      const newTraining = {
        equivalent: req.body.niveau.toUpperCase(),
        intitule: toTitleCase(req.body.intitule),
        ecole: toTitleCase(req.body.ecole),
        ville: toTitleCase(req.body.ville),
        pays: toTitleCase(req.body.pays),
        date_debut: req.body.date_debut,
        date_fin: req.body.date_fin,
        scan_diplome: {
          id: req.file.public_id,
          url: req.file.url,
          format: req.file.format
        },
        user: req.user.id
      };

      new Training(newTraining).save().then(training => {
        req.flash("success_msg", "Nouvelle formation ajoutée");
        res.redirect("/trainings");
      });
    }
  }
});

module.exports = router;
