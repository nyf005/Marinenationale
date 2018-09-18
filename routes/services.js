const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Service = mongoose.model("services");
const Unite = mongoose.model("unites");

// Liste des services
router.get("/", (req, res) => {
  Service.find().then(services => {
    res.render("services/index", {
      services: services
    });
  });
});

// Formulaire d'ajout de services
router.get("/add", (req, res) => {
  Unite.find().then(unites => {
    res.render("services/add", {
      unites: unites
    });
  });
});

// Traitement du formulaire d'ajout
router.post("/add", (req, res) => {
  let errors = [];

  if (!req.body.service) {
    errors.push({
      text: `Veuillez entrer le nom du service`
    });
  }

  if (errors.length > 0) {
    Unite.find().then(unites => {
      res.render("services/add", {
        errors: errors,
        unites: unites,
        unite: req.body.unite,
        service: req.body.service,
        abreviation: req.body.abreviation
      });
    });
  } else {
    const newService = {
      nom: req.body.service,
      abreviation: req.body.abreviation,
      unite: req.body.unite
    };

    new Service(newService).save().then(service => {
      req.flash("success_msg", "Nouveau service ajouté");
      res.redirect("/services/add");
    });
  }
});

// Formulaire de modification de services
router.get("/edit/:id", (req, res) => {
  Service.findOne({
    _id: req.params.id
  })
    .populate("unite")
    .then(serv => {
      Unite.find().then(unites => {
        res.render("services/edit", {
          serv: serv,
          unites: unites
        });
      });
    });
});

// Traitement du formulaire de modification
router.put("/edit/:id", (req, res) => {
  let errors = [];

  if (!req.body.service) {
    errors.push({
      text: `Veuillez entrer le nom du service`
    });
  }

  if (errors.length > 0) {
    Service.findOne({
      _id: req.params.id
    })
      .populate("unite")
      .then(serv => {
        Unite.find().then(unites => {
          res.render("services/edit", {
            serv: serv,
            errors: errors,
            unite: req.body.unite,
            service: req.body.service,
            abreviation: req.body.abreviation,
            unites: unites
          });
        });
      });
    // res.render("services/edit", {
    //   errors: errors,
    //   unite: req.body.unite,
    //   service: req.body.service,
    //   abreviation: req.body.abreviation
    // });
  } else {
    Service.findOne({
      _id: req.params.id
    }).then(service => {
      service.nom = req.body.service;
      service.abreviation = req.body.abreviation;
      service.unite = req.body.unite;

      service.save().then(service => {
        req.flash("success_msg", "Service mis à jour avec succès");
        res.redirect("/services");
      });
    });
  }
});

// Suppression d'un service
router.delete("/delete/:id", (req, res) => {
  Service.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "Service supprimé");
    res.redirect("/services");
  });
});

module.exports = router;
