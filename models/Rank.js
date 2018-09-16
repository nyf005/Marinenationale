const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RankSchema = new Schema({
  grade : {
    type: String
  },
  abreviation: {
    type: String
  },
  categorie: {
    type: String
  },
  sousCategorie: {
    type: String
  },
  ordre: {
    type: Number
  }
});

mongoose.model('ranks', RankSchema);