const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index/welcome");
});

// ORGANISATION
router.get("/organisation/commandement", (req, res) => {
  res.render("index/organisation/commandement");
});
router.get("/organisation/unites", (req, res) => {
  res.render("index/organisation/unites");
});
router.get("/organisation/soutien", (req, res) => {
  res.render("index/organisation/soutien");
});

// MISSIONS
router.get("/missions", (req, res) => {
  res.render("index/missions");
});

// EQUIPEMENTS
router.get("/equipements/patrouilleurs", (req, res) => {
  res.render("index/equipements/patrouilleurs");
});
router.get("/equipements/embarcations", (req, res) => {
  res.render("index/equipements/embarcations");
});

// RESSOURCES HUMAINES
router.get("/ressources_humaines/recrutement", (req, res) => {
  res.render("index/ressources_humaines/recrutement");
});
router.get("/ressources_humaines/formation", (req, res) => {
  res.render("index/ressources_humaines/formation");
});
router.get("/ressources_humaines/ecole", (req, res) => {
  res.render("index/ressources_humaines/ecole");
});

// PATRIMOINE
router.get("/patrimoine/histoire", (req, res) => {
  res.render("index/patrimoine/histoire");
});
router.get("/patrimoine/traditions", (req, res) => {
  res.render("index/patrimoine/traditions");
});
router.get("/patrimoine/sport", (req, res) => {
  res.render("index/patrimoine/sport");
});
router.get("/patrimoine/orchestre", (req, res) => {
  res.render("index/patrimoine/orchestre");
});

module.exports = router;