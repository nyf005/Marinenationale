const express = require("express");
const moment = require("moment");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const Training = mongoose.model("trainings");
const User = mongoose.model("users");
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
  folder: "usersDiplomes",
  allowedFormats: ["jpg", "jpeg", "png"]
  // transformation: [{ width: 500, height: 500, gravity: "face", crop: "thumb" }]
});
const upload = multer({ storage });

// Liste des formations
router.get("/", ensureAuthenticated, (req, res) => {
  permission = checkGrant(req.user.statut, "readOwn", "training", req, res);
  if (permission) {
    Training.find({
      user: req.user.id
    })
      .sort({ date_fin: "desc" })
      .then(trainings => {
        if (trainings) {
          let niveau;
          if (trainings.equivalent == "EDG") {
            niveau = "Ecole de Guerre";
            res.render("trainings/index", {
              trainings: trainings,
              niveau: niveau
            });
          } else {
            res.render("trainings/index", {
              trainings: trainings
            });
          }
        } else {
          res.render("trainings/index");
        }
      });
  }
});



module.exports = router;
