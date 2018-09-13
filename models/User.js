const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  mecano: {
    type: Number,
    required: true
  },
  matricule: {
    type: String,
    required: true
  },
  grade: {
    type: String
  },
  nom: {
    type: String
  },
  prenoms: {
    type: String
  },
  dateNaiss: {
    type: Date
  },
  lieuNaiss: {
    type: String
  },
  nomPere: {
    type: String
  },
  nomMere: {
    type: String
  },
  dateEntreeService: {
    type: Date
  },
  dateNomination: {
    type: Date
  },
  photo: {
    type: String,
    data: Buffer
  },
  unite: {
    type: String,
  },
  position: {
    type: String
  }
});

mongoose.model("users", UserSchema);
