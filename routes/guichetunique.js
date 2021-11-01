const express = require("express");
const moment = require("moment");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const User = mongoose.model("users");
const Rank = mongoose.model("ranks");
const Unite = mongoose.model("unites");
const Service = mongoose.model("services");
const Affectation = mongoose.model("affectations");
const Promotion = mongoose.model("promotions");
const Training = mongoose.model("trainings");

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
       // To prevent removing of parties without addresses you should
      // set preserveNullAndEmptyArrays option of $unwind stage to true.

      User.aggregate([
        {
          $lookup: {
            from: "ranks",
            localField: "grade",
            foreignField: "_id",
            as: "grade"
          }
        },
        { $unwind: "$grade" },
        {
          $lookup: {
            from: "unites",
            localField: "unite",
            foreignField: "_id",
            as: "unite"
          }
        },
        { $unwind: "$unite" },
        {
          $lookup: {
            from: "services",
            localField: "service",
            foreignField: "_id",
            as: "service"
          }
        },
        { $unwind: "$service" },
        {
          $lookup: {
            from: Affectation.collection.name,
            localField: "_id",
            foreignField: "user",
            as: "affectations"
          }
        },
        {
          $unwind: {
            path: "$affectations",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: Unite.collection.name,
            localField: "affectations.unite",
            foreignField: "_id",
            as: "affectations.unite"
          }
        },
        {
          $lookup: {
            from: Service.collection.name,
            localField: "affectations.service",
            foreignField: "_id",
            as: "affectations.service"
          }
        },
        {
          $unwind: {
            path: "$affectations.unite",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$affectations.service",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: Promotion.collection.name,
            localField: "_id",
            foreignField: "user",
            as: "promotions"
          }
        },
        {
          $unwind: {
            path: "$promotions",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: Rank.collection.name,
            localField: "promotions.grade",
            foreignField: "_id",
            as: "promotions.grade"
          }
        },
        {
          $unwind: {
            path: "$promotions.grade",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: Training.collection.name,
            localField: "_id",
            foreignField: "user",
            as: "trainings"
          }
        },
        {
          $unwind: {
            path: "$trainings",
            preserveNullAndEmptyArrays: true
          }
        },

        // To prevent duplicating of parties for its different addresses you should
        // add $group aggregation stage to your pipeline.
        // Also, use $project stage with $filter operator to exclude empty address records in output.

        {
          $group: {
            _id: "$_id",
            statut: { $first: "$statut" },
            mecano: { $first: "$mecano" },
            matricule: { $first: "$matricule" },
            grade: { $first: "$grade" },
            nom: { $first: "$nom" },
            prenoms: { $first: "$prenoms" },
            genre: { $first: "$genre" },
            naissance: { $first: "$naissance" },
            parents: { $first: "$parents" },
            dateEntreeService: { $first: "$dateEntreeService" },
            dateNomination: { $first: "$dateNomination" },
            unite: { $first: "$unite" },
            service: { $first: "$service" },
            password: { $first: "$password" },
            affectations: { $addToSet: "$affectations" },
            promotions: { $addToSet: "$promotions" },
            trainings: { $addToSet: "$trainings" }
          }
        },
        {
          $project: {
            _id: 1,
            statut: 1,
            mecano: 1,
            matricule: 1,
            grade: 1,
            nom: 1,
            prenoms: 1,
            genre: 1,
            naissance: 1,
            parents: 1,
            dateEntreeService: 1,
            dateNomination: 1,
            unite: 1,
            service: 1,
            password: 1,
            affectations: {
              $filter: {
                input: "$affectations",
                as: "a",
                cond: { $ifNull: ["$$a._id", false] }
              }
            },
            promotions: {
              $filter: {
                input: "$promotions",
                as: "p",
                cond: { $ifNull: ["$$p._id", false] }
              }
            },
            trainings: {
              $filter: {
                input: "$trainings",
                as: "t",
                cond: { $ifNull: ["$$t._id", false] }
              }
            }
          }
        }
      ]).then(users => {
        res.render("guichetunique/index", {
          users: users
        });
      });
    // User.find()
    //   .populate("unite")
    //   .populate("service")
    //   .populate("grade")
    //   .sort({ nom: "asc" })
    //   .then(users => {
    //     res.render("guichetunique/index", {
    //       users: users
    //     });
    //   });
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
