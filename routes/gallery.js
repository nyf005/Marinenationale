const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const fetch = require("node-fetch");
global.fetch = fetch;
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;

const unsplash = new Unsplash({
  accessKey: "96b08d4e9f918d7687fe4a1cade9a2ac5897d30db1faa40580b168a33d59f650"
});

const Photo = mongoose.model("photos");
//Load Keys
const keys = require("../config/keys");

const { ensureAuthenticated, checkGrant } = require("../helpers/functions");

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
  folder: "photoGallery",
  allowedFormats: ["jpg", "jpeg", "png"],
  transformation: [{ quality: "auto" }]
});
const upload = multer({ storage });

router.get("/", (req, res) => {
  unsplash.search
    .photos("military navy", 1, 30)
    .then(toJson)
    .then(photos => {
      res.render("gallery/index", {
        photos: photos.results
      });
    });

  // Photo.find().then(photos => {
  //   res.render("gallery/index", {
  //     photos: photos
  //   });
  // });
});

router.get("/add", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "photo", req, res);
  if (permission) {
    Photo.find().then(photos => {
      res.render("gallery/add", {
        photos: photos
      });
    });
  }
});

router.post("/add", upload.single("image"), (req, res) => {
  permission = checkGrant(req.user.statut, "createAny", "photo", req, res);
  if (permission) {
    let errors = [];
    if (!req.body.titre) {
      errors.push({
        text: "Veuillez donner un titre à la photo"
      });
    }

    if (!req.file) {
      errors.push({
        text: "Veuillez sélectionner une photo"
      });
    }

    if (errors.length > 0) {
      if (req.file) {
        cloudinary.v2.uploader.destroy(req.file.public_id);
      }
      res.render("gallery/add", {
        errors: errors,
        titre: req.body.titre,
        description: req.body.description,
        image: req.file
      });
    } else {
      const { titre, description } = req.body;
      const newPhoto = {
        titre,
        description,
        image: {
          id: req.file.public_id,
          url: req.file.url,
          format: req.file.format
        }
      };
      new Photo(newPhoto).save().then(photo => {
        req.flash("success_msg", "Nouvelle photo ajoutée");
        res.redirect("/gallery/add");
      });
    }
  }
});

router.delete("/delete/:id", (req, res) => {
  permission = checkGrant(req.user.statut, "deleteAny", "photo", req, res);
  if (permission) {
    Photo.findByIdAndDelete({ _id: req.params.id })
      .then(photo => {
        cloudinary.v2.uploader.destroy(photo.image.id);
      })
      .then(() => {
        req.flash("success_msg", "Photo supprimée");
        res.redirect("/gallery/add");
      });
  }
});

module.exports = router;
