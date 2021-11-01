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

const {
  ensureAuthenticated,
  checkGrant,
  toTitleCase
} = require("../helpers/functions");

let permission;

//Load Keys
const keys = require("../config/keys");

router.get("/", ensureAuthenticated, (req, res) => {
  //   permission = checkGrant(req.user.statut, "createAny", "promotion", req, res);
  //   if (permission) {

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
    res.render("promotions/index", {
      users: users
    });
  });

  // User.find()
  //   .populate("unite")
  //   .populate("service")
  //   .populate("grade")
  //   .sort({ nom: "asc" })
  //   .then(users => {
  //     res.render("promotions/index", {
  //       users: users
  //     });
  //   });
  //   }
});

// Formulaire d'ajout de mouvement
router.get("/add/:id", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "movement", req, res);
  if (permission) {
    User.findOne({ _id: req.params.id })
      .populate("grade")
      .then(user => {
        Rank.find().then(ranks => {
          res.render("promotions/add", {
            ranks: ranks,
            user: user
          });
        });
      });
  }
});

// Traitement du formulaire d'ajout de mouvement
router.post("/add/:id", ensureAuthenticated, (req, res) => {
  //   permission = checkGrant(req.user.statut, "createAny", "movement", req, res);
  //   if (permission) {
  let errors = [];

  if (!req.body.reference) {
    errors.push({
      text: "Veuillez entrer la référence de la promotion"
    });
  }

  if (!req.body.grade) {
    errors.push({
      text: `Veuillez sélectionner le grade du marin`
    });
  }

  if (!req.body.datePromotion) {
    errors.push({
      text: "Veuillez entrer la date de promotion"
    });
  }

  //   if (moment(req.body.dateFin).isBefore(req.body.dateDebut)) {
  //     errors.push({
  //       text:
  //         "La date de fin ne peut pas être inférieure à la date de début du mouvement"
  //     });
  //   }

  User.findOne({ _id: req.params.id }).then(user => {
    if (errors.length > 0) {
      Rank.find()
        .sort({ ordre: "asc" })
        .then(ranks => {
          res.render("promotions/add", {
            errors: errors,
            user: user,
            ranks: ranks,
            reference: req.body.reference,
            grade: req.body.grade,
            datePromotion: req.body.datePromotion
          });
        });
    } else {
      const newPromotion = {
        reference: req.body.reference.toUpperCase(),
        grade: req.body.grade,
        date: req.body.datePromotion,
        user: user.id
      };

      new Promotion(newPromotion).save().then(promotion => {
        req.flash("success_msg", "Nouvelle promotion ajoutée avec succès");
        res.redirect("/promotions");
      });
    }
  });
  //   }
});

//Get all promotions of a user
router.get("/userpromotions/:id", ensureAuthenticated, (req, res) => {
  //   permission = checkGrant(req.user.statut, "readAny", "movement", req, res);
  //   if (permission) {
  Promotion.find({
    user: req.params.id
  })
    .populate("grade")
    .sort({ date: "desc" })
    .then(promotions => {
      res.render("promotions/userpromotions", {
        promotions: promotions
      });
    });
  //   }
});

router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Promotion.findOne({
    _id: req.params.id
  }).then(promotion => {
    User.findOne({
      _id: req.user.id
    }).then(user => {
      Rank.find()
        .sort({ ordre: "asc" })
        .then(ranks => {
          //   permission = checkGrant(user.statut, "updateAny", "movement", req, res);
          //   if (permission) {
          res.render("promotions/edit", {
            promotion: promotion,
            ranks: ranks
          });
          //   } else {
          //     req.flash(
          //       "errors_msg",
          //       "Vous n'êtes pas autorisé à accéder à cette page."
          //     );
          //   }
        });
    });
  });
});

router.put("/edit/:id", ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.reference) {
    errors.push({
      text: "Veuillez entrer la référence de la promotion"
    });
  }

  if (!req.body.grade) {
    errors.push({
      text: "Veuillez sélectionner le nouveau grade"
    });
  }

  if (!req.body.datePromotion) {
    errors.push({
      text: "Veuillez entrer la date de promotion"
    });
  }

  // if (moment(req.body.dateFin).isBefore(req.body.dateDebut)) {
  //   errors.push({
  //     text:
  //       "La date de fin ne peut pas être inférieure à la date de début du mouvement"
  //   });
  // }

  Promotion.findOne({
    _id: req.params.id
  }).then(promotion => {
    User.findOne({
      _id: req.user.id
    }).then(user => {
      Rank.find()
        .sort({ ordre: "asc" })
        .then(ranks => {
          //   permission = checkGrant(user.statut, "updateAny", "movement", req, res);
          //   if (permission) {
          if (errors.length > 0) {
            res.render("promotions/edit", {
              errors: errors,
              promotion: promotion,
              ranks: ranks,
              reference: req.body.reference,
              grade: req.body.grade,
              datePromotion: req.body.datePromotion
            });
          } else {
            promotion.reference = req.body.reference.toUpperCase();
            promotion.grade = req.body.grade;
            promotion.date = req.body.datePromotion;

            promotion.save().then(() => {
              req.flash("success_msg", "Modifications effectuées avec succès");
              res.redirect("/promotions/userpromotions/" + promotion.user);
            });
          }
          //   } else {
          //     req.flash(
          //       "errors_msg",
          //       "Vous n'êtes pas autorisé à accéder à cette page."
          //     );
          //     res.redirect("/");
        });
    });
  });
});
// });

router.delete("/delete/:id", ensureAuthenticated, (req, res) => {
  Promotion.findOne({
    _id: req.params.id
  }).then(promotion => {
    // User.findOne({
    //   _id: req.user.id
    // }).then(user => {
    //   permission = checkGrant(user.statut, "deleteAny", "movement", req, res);
    //   if (permission) {
    Promotion.deleteOne({
      _id: req.params.id
    }).then(() => {
      req.flash("success_msg", "Promotion supprimée");
      res.redirect("/promotions/userpromotions/" + promotion.user);
    });
    //   }
    // });
  });
});

module.exports = router;
