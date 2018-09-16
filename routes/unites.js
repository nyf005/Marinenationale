const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Unite = mongoose.model("unites");

// Liste des unités
router.get("/", (req, res) => {
  Unite.find().then(unites => {
    res.render("unites/index", {
      unites: unites
    });
  });
});

// Formulaire d'ajout d'unités
router.get("/add", (req, res) => {
  res.render("unites/add");
});

// Traitement du formulaire d'ajout d'unités
router.post("/add", (req, res) => {
  let errors = [];

  if (!req.body.unite){
    errors.push({
      text: `Veuillez entrer le nom de l'unité`
    });
  }

  if (errors.length > 0){
    res.render("unites/add", {
      errors: errors,
      unite: req.body.unite,
      abreviation: req.body.abreviation
    });
  } else {
    const newUnite = {
      nom: req.body.unite,
      abreviation: req.body.abreviation
    };

    new Unite(newUnite).save().then(unite => {
      req.flash("success_msg", "Nouvelle unité ajoutée");
      res.redirect("/unites/add");
    }).catch(err => {
      console.log(err);
    })
  }
})

// Formulaire de modification d'unités
router.get("/edit/:id", (req, res) => {
  Unite.findOne({
    _id: req.params.id
  }).then(unite => {
    res.render("unites/edit", {
      unite: unite
    });
  });
});

// Traitement du formulaire de modification
router.put("/edit/:id", (req, res) => {
  let errors = [];

  if (!req.body.unite){
    errors.push({
      text: `Veuillez entrer le nom de l'unité`
    });
  }

  if (errors.length > 0){
    res.render("unites/edit", {
      errors: errors,
      unite: req.body.unite,
      abreviation: req.body.abreviation
    });
  } else {
    Unite.findOne({
      _id: req.params.id
    }).then(unite => {
      unite.nom = req.body.unite;
      unite.abreviation = req.body.abreviation;

      unite.save().then(unite => {
        req.flash("success_msg", "Unité mise à jour avec succès");
        res.redirect("/unites");
      });
    });
  }
});

// Suppression d'unités
router.delete("/delete/:id", (req, res) => {
  Unite.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "Unité suprrimée");
    res.redirect("/unites");
  });
});

module.exports = router;
