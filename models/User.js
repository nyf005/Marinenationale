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
  naissance : {
    date: {
      type: Date
    },
    lieu: {
      type: String
    },
    sousPref: {
      type: String
    }
  },
  parents : {
    pere: {
      type: String
    },
    mere: {
      type: String
    },
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
  service: {
    type: String,
  },
  position: {
    type: String
  },
  status:{
    type: String,
    default: "utilisateur"
  }
});

mongoose.model("users", UserSchema);
