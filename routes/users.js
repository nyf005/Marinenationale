const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = mongoose.model("users");

router.get("/add", (req, res) => {
  res.send("Adding User");
});

router.get("/edit", (reeq, res) => {
  res.send("Editing User");
});


module.exports = router;