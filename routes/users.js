const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = mongoose.model("users");

router.get("/add", (req, res) => {
  res.render('users/add');
});

router.get("/edit", (reeq, res) => {
  res.render("users/edit");
});


module.exports = router;