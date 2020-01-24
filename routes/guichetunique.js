const express = require("express");
const moment = require("moment");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const Training = mongoose.model("trainings");
const User = mongoose.model("users");

//Load Keys
const keys = require("../config/keys");

const {
  ensureAuthenticated,
  checkGrant,
  toTitleCase
} = require("../helpers/functions");

//Access Control Grants Var
let permission;

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

// Liste des marins
router.get("/", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "training", req, res);
  if (permission) {
    User.find()
      .populate("unite")
      .populate("service")
      .populate("grade")
      .sort({ nom: "asc" })
      .then(users => {
        res.render("guichetunique/index", {
          users: users
        });
      });
  }
});

// Formulaire d'ajout de formation
router.get("/add/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "training", req, res);
  if (permission) {
    User.findOne({ _id: req.params.id }).then(user => {
      res.render("guichetunique/add", {
        user: user
      });
    });
  }
});

// Traitement du formulaire d'ajout de formation
router.post(
  "/add/:id",
  upload.single("scan_diplome"),
  ensureAuthenticated,
  (req, res) => {
    permission = checkGrant(req.user.statut, "createAny", "training", req, res);
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
            "Veuillez entrer le pays dans lequel vous avez effectué votre stage ou formation"
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
      User.findOne({ _id: req.params.id }).then(user => {
        if (errors.length > 0) {
          if (req.file) {
            cloudinary.v2.uploader.destroy(req.file.public_id);
          }
          res.render("guichetunique/add", {
            errors: errors,
            user: user,
            niveau: req.body.niveau,
            intitule: req.body.intitule,
            ecole: req.body.ecole,
            ville: req.body.ville,
            pays: req.body.pays,
            date_debut: req.body.date_debut,
            date_fin: req.body.date_fin,
            scan_diplome: req.file
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
            user: user.id
          };

          new Training(newTraining).save().then(training => {
            req.flash("success_msg", "Nouvelle formation ajoutée");
            res.redirect("/guichetunique");
          });
        }
      });
    }
  }
);

//Get all training of a user
router.get("/usertrainings/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "readAny", "training", req, res);
  if (permission) {
    Training.find({
      user: req.params.id
    })
      .sort({ date_fin: "desc" })
      .then(trainings => {
        User.findOne({
          _id: req.params.id
        })
          .populate("grade")
          .then(user => {
            if (trainings) {
              let niveau;
              if (trainings.equivalent == "EDG") {
                niveau = "Ecole de Guerre";
                res.render("guichetunique/usertrainings", {
                  trainings: trainings,
                  user: user,
                  niveau: niveau
                });
              } else {
                res.render("guichetunique/usertrainings", {
                  trainings: trainings,
                  user: user
                });
              }
            } else {
              res.render("guichetunique/usertrainings");
            }
          });
      });
  }
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Training.findOne({
    _id: req.params.id
  }).then(training => {
    User.findOne({
      _id: req.user.id
    }).then(user => {
      permission = checkGrant(user.statut, "updateAny", "training", req, res);
      if (permission) {
        res.render("guichetunique/edit", {
          training: training
        });
      } else {
        req.flash(
          "errors_msg",
          "Vous n'êtes pas autorisé à accéder à cette page."
        );
      }
    });
  });
});

router.put(
  "/edit/:id",
  upload.single("scan_diplome"),
  ensureAuthenticated,
  (req, res) => {
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
          "Veuillez entrer le pays dans lequel vous avez effectué votre stage ou formation"
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

    Training.findOne({
      _id: req.params.id
    }).then(training => {
      User.findOne({
        _id: req.user.id
      }).then(user => {
        permission = checkGrant(user.statut, "updateAny", "training", req, res);
        if (permission) {
          if (errors.length > 0) {
            if (req.file) {
              cloudinary.v2.uploader.destroy(req.file.public_id);
            }
            res.render("guichetunique/edit", {
              errors: errors,
              training: training,
              niveau: req.body.niveau,
              intitule: req.body.intitule,
              ecole: req.body.ecole,
              ville: req.body.ville,
              pays: req.body.pays,
              date_debut: req.body.date_debut,
              date_fin: req.body.date_fin
            });
          } else {
            training.equivalent = req.body.niveau.toUpperCase();
            training.intitule = toTitleCase(req.body.intitule);
            training.ecole = toTitleCase(req.body.ecole);
            training.ville = toTitleCase(req.body.ville);
            training.pays = toTitleCase(req.body.pays);
            training.date_debut = req.body.date_debut;
            training.date_fin = req.body.date_fin;
            if (req.file) {
              cloudinary.v2.uploader.destroy(training.scan_diplome.id);
              training.scan_diplome.id = req.file.public_id;
              training.scan_diplome.url = req.file.url;
              training.scan_diplome.format = req.file.format;
            }

            training.save().then(() => {
              req.flash("success_msg", "Modifications effectuées avec succès");
              res.redirect("/guichetunique/usertrainings/" + training.user);
            });
          }
        } else {
          req.flash(
            "errors_msg",
            "Vous n'êtes pas autorisé à accéder à cette page."
          );
          res.redirect("/");
        }
      });
    });
  }
);

router.delete("/delete/:id", ensureAuthenticated, (req, res) => {
  Training.findOne({
    _id: req.params.id
  }).then(training => {
    User.findOne({
      _id: req.user.id
    }).then(user => {
      permission = checkGrant(user.statut, "deleteAny", "training", req, res);
      if (permission) {
        cloudinary.v2.uploader.destroy(training.scan_diplome.id);
        Training.deleteOne({
          _id: req.params.id
        }).then(() => {
          req.flash("success_msg", "Formation supprimée");
          res.redirect("/guichetunique/usertrainings/" + training.user);
        });
      }
    });
  });
});

module.exports = router;
