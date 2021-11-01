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
const Movement = mongoose.model("movements");

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
  folder: "movementsJustificatifs",
  allowedFormats: ["jpg", "jpeg", "png"]
  // transformation: [{ width: 500, height: 500, gravity: "face", crop: "thumb" }]
});
const upload = multer({ storage });

router.get("/", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "movement", req, res);
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
      res.render("movements/index", {
        users: users
      });
    });
    // User.find()
    //   .populate("unite")
    //   .populate("service")
    //   .populate("grade")
    //   .sort({ nom: "asc" })
    //   .then(users => {
    //     res.render("movements/index", {
    //       users: users
    //     });
    //   });
  }
});

// Formulaire d'ajout de mouvement
router.get("/add/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "movement", req, res);
  if (permission) {
    User.findOne({ _id: req.params.id })
      .populate("grade")
      .then(user => {
        res.render("movements/add", {
          user: user
        });
      });
  }
});

// Traitement du formulaire d'ajout de mouvement
router.post(
  "/add/:id",
  upload.single("scan_justificatif"),
  ensureAuthenticated,
  (req, res) => {
    permission = checkGrant(req.user.statut, "createAny", "movement", req, res);
    if (permission) {
      let errors = [];

      if (!req.body.reference) {
        errors.push({
          text: "Veuillez entrer la référence du mouvement"
        });
      }

      if (!req.body.objet) {
        errors.push({
          text: "Veuillez entrer l'objet du mouvement"
        });
      }

      if (!req.body.type) {
        errors.push({
          text: "Veuillez sélectionner le type de mouvement"
        });
      }
      if (!req.body.ville) {
        errors.push({
          text: "Veuillez entrer la ville de destination"
        });
      }
      if (!req.body.pays) {
        errors.push({
          text: "Veuillez entrer le pays de destination"
        });
      }

      if (!req.body.dateDebut) {
        errors.push({
          text: "Veuillez entrer la date de début du mouvement"
        });
      }

      if (!req.body.dateFin) {
        errors.push({
          text: "Veuillez entrer la date de fin du mouvement"
        });
      }

      if (moment(req.body.dateFin).isBefore(req.body.dateDebut)) {
        errors.push({
          text:
            "La date de fin ne peut pas être inférieure à la date de début du mouvement"
        });
      }

      if (!req.file) {
        errors.push({
          text:
            "Veuillez ajouter une copie scannée de la pièce justificative du mouvement"
        });
      }
      User.findOne({ _id: req.params.id }).then(user => {
        if (errors.length > 0) {
          if (req.file) {
            cloudinary.v2.uploader.destroy(req.file.public_id);
          }
          res.render("movements/add", {
            errors: errors,
            user: user,
            reference: req.body.reference,
            objet: req.body.objet,
            type: req.body.type,
            ville: req.body.ville,
            pays: req.body.pays,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            scan_justificatif: req.file
          });
        } else {
          const newMovement = {
            reference: req.body.reference.toUpperCase(),
            objet: toTitleCase(req.body.objet),
            type: req.body.type.toUpperCase(),
            ville: toTitleCase(req.body.ville),
            pays: toTitleCase(req.body.pays),
            date_depart: req.body.dateDebut,
            date_fin: req.body.dateFin,
            scan_justificatif: {
              id: req.file.public_id,
              url: req.file.url,
              format: req.file.format
            },
            user: user.id
          };

          new Movement(newMovement).save().then(movement => {
            req.flash("success_msg", "Mouvement ajouté avec succès");
            res.redirect("/movements");
          });
        }
      });
    }
  }
);

//Get all movements of a user
router.get("/usermovements/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "readAny", "movement", req, res);
  if (permission) {
    Movement.find({
      user: req.params.id
    })
      .sort({ date_fin: "desc" })
      .then(movements => {
        User.findOne({
          _id: req.params.id
        })
          .populate("grade")
          .then(user => {
            res.render("movements/usermovements", {
              movements: movements,
              user: user
            });
          });
      });
  }
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Movement.findOne({
    _id: req.params.id
  }).then(movement => {
    User.findOne({
      _id: req.user.id
    }).then(user => {
      permission = checkGrant(user.statut, "updateAny", "movement", req, res);
      if (permission) {
        res.render("movements/edit", {
          movement: movement
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
  upload.single("scan_justificatif"),
  ensureAuthenticated,
  (req, res) => {
    let errors = [];

    if (!req.body.reference) {
      errors.push({
        text: "Veuillez entrer la référence du mouvement"
      });
    }

    if (!req.body.objet) {
      errors.push({
        text: "Veuillez entrer l'objet du mouvement"
      });
    }

    if (!req.body.type) {
      errors.push({
        text: "Veuillez sélectionner le type de mouvement"
      });
    }
    if (!req.body.ville) {
      errors.push({
        text: "Veuillez entrer la ville de destination"
      });
    }
    if (!req.body.pays) {
      errors.push({
        text: "Veuillez entrer le pays de destination"
      });
    }

    if (!req.body.dateDebut) {
      errors.push({
        text: "Veuillez entrer la date de début du mouvement"
      });
    }

    if (!req.body.dateFin) {
      errors.push({
        text: "Veuillez entrer la date de fin du mouvement"
      });
    }

    if (moment(req.body.dateFin).isBefore(req.body.dateDebut)) {
      errors.push({
        text:
          "La date de fin ne peut pas être inférieure à la date de début du mouvement"
      });
    }

    Movement.findOne({
      _id: req.params.id
    }).then(movement => {
      User.findOne({
        _id: req.user.id
      }).then(user => {
        permission = checkGrant(user.statut, "updateAny", "movement", req, res);
        if (permission) {
          if (errors.length > 0) {
            if (req.file) {
              cloudinary.v2.uploader.destroy(req.file.public_id);
            }
            res.render("movements/edit", {
              errors: errors,
              movement: movement,
              reference: req.body.reference,
              objet: req.body.objet,
              type: req.body.type,
              ville: req.body.ville,
              pays: req.body.pays,
              dateDebut: req.body.dateDebut,
              dateFin: req.body.dateFin,
              scan_justificatif: req.file
            });
          } else {
            movement.reference = req.body.reference.toUpperCase();
            movement.objet = toTitleCase(req.body.objet);
            movement.type = req.body.type.toUpperCase();
            movement.ville = toTitleCase(req.body.ville);
            movement.pays = toTitleCase(req.body.pays);
            movement.date_depart = req.body.dateDebut;
            movement.date_fin = req.body.dateFin;
            if (req.file) {
              cloudinary.v2.uploader.destroy(movement.scan_justificatif.id);
              movement.scan_justificatif.id = req.file.public_id;
              movement.scan_justificatif.url = req.file.url;
              movement.scan_justificatif.format = req.file.format;
            }

            movement.save().then(() => {
              req.flash("success_msg", "Modifications effectuées avec succès");
              res.redirect("/movements/usermovements/" + movement.user);
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
  Movement.findOne({
    _id: req.params.id
  }).then(movement => {
    User.findOne({
      _id: req.user.id
    }).then(user => {
      permission = checkGrant(user.statut, "deleteAny", "movement", req, res);
      if (permission) {
        cloudinary.v2.uploader.destroy(movement.scan_justificatif.id);
        Movement.deleteOne({
          _id: req.params.id
        }).then(() => {
          req.flash("success_msg", "Mouvement supprimé");
          res.redirect("/movements/usermovements/" + movement.user);
        });
      }
    });
  });
});

module.exports = router;
