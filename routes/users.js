const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const User = mongoose.model("users");
const Rank = mongoose.model("ranks");
const Unite = mongoose.model("unites");
const Service = mongoose.model("services");

//Load Keys
const keys = require("../config/keys");

const {
  select,
  equal,
  dateFormat,
  formatDate
} = require("../helpers/functions");

// Cloudinary Config
cloudinary.config({
  cloud_name: keys.cloudinaryName,
  api_key: keys.cloudinaryApiKey,
  api_secret: keys.cloudinaryApiSecret
});

//Create Storage engine
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "usersImages",
  allowedFormats: ["jpg", "jpeg", "png"],
  transformation: [{gravity: "face", crop: "thumb"}]
});
const upload = multer({ storage });

// Liste des marins
router.get("/", (req, res) => {
  res.render("users/index");
});

// Formulaire d'ajout des membres
router.get("/add", (req, res) => {
  Rank.find()
    .sort({ ordre: "asc" })
    .then(ranks => {
      res.render("users/add", {
        ranks: ranks
      });
    });
});

// Traitement du formulaire d'ajout de membre
router.post("/add", (req, res) => {
  let errors = [];

  if (!req.body.mecano) {
    errors.push({
      text: `Veuillez entrer le mécano du membre`
    });
  }

  if (!req.body.matricule) {
    errors.push({
      text: `Veuillez entrer le matricule du membre`
    });
  }

  if (!req.body.grade) {
    errors.push({
      text: `Veuillez sélectionner le grade du membre`
    });
  }

  if (!req.body.nom) {
    errors.push({
      text: `Veuillez entrer le nom du membre`
    });
  }

  if (!req.body.prenoms) {
    errors.push({
      text: `Veuillez entrer le ou les prénoms du membre`
    });
  }

  if (errors.length > 0) {
    Rank.find()
      .sort({ ordre: "asc" })
      .then(ranks => {
        res.render("users/add", {
          errors: errors,
          ranks: ranks,
          mecano: req.body.mecano,
          matricule: req.body.matricule,
          grade: req.body.grade,
          nom: req.body.nom,
          prenoms: req.body.prenoms,
          statut: req.body.statut
        });
      });
  } else {
    const newUser = {
      mecano: req.body.mecano,
      matricule: req.body.matricule,
      grade: req.body.grade,
      nom: req.body.nom,
      prenoms: req.body.prenoms,
      statut: req.body.statut
    };

    User.findOne({
      mecano: newUser.mecano
    }).then(user => {
      if (user) {
        req.flash("errors_msg", "Ce membre existe déja");
        res.redirect("/users/add");
      } else {
        new User(newUser).save().then(user => {
          req.flash("success_msg", "Nouveau membre ajouté");
          res.redirect("/users/add");
        });
      }
    });
  }
});

// Connexion Utilisateur ; Still have the login process to do
router.post("/login", (req, res, next) => {
  User.findOne({
    mecano: req.body.mecano
  })
    .populate("unite")
    .populate("service")
    .then(user => {
      if (user.password) {
        passport.authenticate("local", {
          successRedirect: "/",
          failureRedirect: "/",
          failureFlash: true
        })(req, res, next);
      } else {
        //Pas de mot de passe, Identification avec mot de passe par défaut
        if (req.body.password === "M@rine20nationale18") {
          Unite.find().then(unites => {
            Service.find().then(services => {
              res.render(`users/edit`, {
                user: user,
                unites: unites,
                services: services
              });
            });
          });
        } else {
          req.flash(
            "errors_msg",
            "Le mot de passe saisi est incorrect. Vous ne pouvez pas accéder à l'espace membre"
          );
          res.redirect("/");
        }
      }
    });
});

// Formulaire de mise à jour d'infos membres
router.get("/edit/:id", (req, res) => {
  User.findOne({
    _id: req.params.id
  })
    .populate("unite")
    .populate("service")
    .then(user => {
      Unite.find().then(unites => {
        Service.find().then(services => {
          res.render("users/edit", {
            user: user,
            unites: unites,
            services: services
          });
        });
      });
    });
});

router.put("/register/:id", upload.single("photo"), (req, res) => {
  let errors = [];
  if (!req.body.genre) {
    errors.push({
      text: "Veuillez sélectionner votre genre"
    });
  }

  if (!req.body.dateNaiss) {
    errors.push({
      text: "Veuillez sélectionner votre date de naissance"
    });
  }

  if (!req.body.lieuNaiss) {
    errors.push({
      text: "Veuillez saisir votre lieu de naissance"
    });
  }

  if (!req.body.pere) {
    errors.push({
      text: "Veuillez saisir le nom complet de votre père"
    });
  }

  if (!req.body.mere) {
    errors.push({
      text: "Veuillez saisir le nom complet de votre mère"
    });
  }

  if (!req.body.dateEntreeService) {
    errors.push({
      text: "Veuillez sélectionner votre date d'entrée en service"
    });
  }

  if (!req.body.dateNomination) {
    errors.push({
      text: "Veuillez sélectionner votre date de nomination au grade actuel"
    });
  }

  if (!req.body.unite) {
    errors.push({
      text: "Veuillez sélectionner votre unité"
    });
  }

  if (!req.body.service) {
    errors.push({
      text: "Veuillez sélectionner votre service"
    });
  }

  if (!req.body.password) {
    errors.push({
      text: "Vous devez obligatoirement définir votre mot de passe"
    });
  }

  if (req.body.password.length < 8) {
    errors.push({
      text: "Votre mot de passe doit contenir au moins 8 caractères"
    });
  }

  if (req.body.password !== req.body.confirm_password) {
    errors.push({
      text: "Vos mots de passe ne sont pas cohérents"
    });
  }

  User.findOne({
    _id: req.params.id
  })
    .populate("unite")
    .populate("service")
    .then(user => {
      Unite.find().then(unites => {
        Service.find().then(services => {
          if (errors.length > 0) {
            res.render("users/edit", {
              errors: errors,
              user: user,
              unites: unites,
              services: services,
              genre: req.body.genre,
              dateNaiss: req.body.dateNaiss,
              lieuNaiss: req.body.lieuNaiss,
              pere: req.body.pere,
              mere: req.body.mere,
              dateEntreeService: req.body.dateEntreeService,
              dateNomination: req.body.dateNomination,
              unite: req.body.unite,
              service: req.body.service,
              password: req.body.password,
              confirm_password: req.body.confirm_password
            });
          } else {
            user.genre = req.body.genre;
            user.naissance.date = req.body.dateNaiss;
            user.naissance.lieu = req.body.lieuNaiss;
            user.parents.pere = req.body.pere;
            user.parents.mere = req.body.mere;
            user.dateEntreeService = req.body.dateEntreeService;
            user.dateNomination = req.body.dateNomination;
            user.unite = req.body.unite;
            user.service = req.body.service;
            if (req.file) {
              cloudinary.v2.uploader.destroy(user.photo.id);
              user.photo.id = req.file.public_id;
              user.photo.url = req.file.url;
            }
            if (req.body.password === user.password) {
              user.save().then(user => {
                req.flash(
                  "success_msg",
                  "Modifications effectuées avec succès"
                );
                res.redirect(`/users/edit/${user.id}`);
              });
            } else {
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                  if (err) throw err;
                  user.password = hash;
                  user.save().then(user => {
                    req.flash(
                      "success_msg",
                      "Vos informations ont été enregistrées avec succès. Vous pouvez vous connecter avec votre nouveau mot de passe pour accéder à votre espace membre."
                    );
                    res.redirect("/");
                  });
                });
              });
            }
          }
        });
      });
    });
});

//Logout Member
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success_msg", "Vous êtes déconnecté");
  res.redirect("/");
});

module.exports = router;
