const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = mongoose.model("users");
const Rank = mongoose.model("ranks");

// Formulaire d'ajout des membres
router.get("/add", (req, res) => {
  Rank.find()
  .sort({ordre: 'asc'})
  .then(ranks => {
    res.render('users/add', {
      ranks : ranks
    });
  })
});

// Traitement du formulaire d'ajout
router.post("/add", (req, res) => {

});

// Formulaire de mise à jour d'infos membres
router.get("/edit", (req, res) => {
  res.render("users/edit");
});


module.exports = router;