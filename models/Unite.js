const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UniteSchema = new Schema({
  nom : {
    type: String
  },
  abreviation: {
    type: String
  }
});

mongoose.model('unites', UniteSchema);