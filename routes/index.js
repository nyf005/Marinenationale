const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const fetch = require("node-fetch");
global.fetch = fetch;
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;
var faker = require("faker");

const unsplash = new Unsplash({
  accessKey: "96b08d4e9f918d7687fe4a1cade9a2ac5897d30db1faa40580b168a33d59f650"
});

const Actualite = mongoose.model("actualites");
const Photo = mongoose.model("photos");

router.get("/", (req, res) => {
  Actualite.find()
    .limit(3)
    .sort({ date_publication: "desc" })
    .then(actualites => {
      unsplash.search
        .photos("random", 7, 30)
        .then(toJson)
        .then(photos => {
          res.render("index/welcome", {
            actualites: actualites,
            photos: photos.results
          });
        });
    });

  // Actualite.find()
  //   .limit(3)
  //   .sort({ date_publication: "desc" })
  //   .then(actualites => {
  //     Photo.find()
  //       .limit(5)
  //       .sort({ _id: "desc" })
  //       .then(photos => {
  //         res.render("index/welcome", {
  //           actualites: actualites,
  //           photos: photos
  //         });
  //       });
  //   });
});

router.get("/login", (req, res) => {
  res.render("index/login");
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
router.get("/equipements/coms", (req, res) => {
  res.render("index/equipements/coms");
});
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

router.get("/generate-fake-data", function(req, res, next) {
  for (var i = 0; i < 100; i++) {
    var actu = new Actualite();

    actu.titre = faker.lorem.word();
    actu.texte = faker.lorem.paragraphs();

    actu.save(function(err) {
      if (err) throw err;
    });
  }
  res.redirect("/actualites");
});

module.exports = router;
