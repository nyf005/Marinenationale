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
    type: String,
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  prenoms: {
    type: String,
    required: true
  },
  genre: {
    type: String
  },
  naissance: {
    date: {
      type: Date
    },
    lieu: {
      type: String
    }
  },
  parents: {
    pere: {
      type: String
    },
    mere: {
      type: String
    }
  },
  dateEntreeService: {
    type: Date
  },
  dateNomination: {
    type: Date
  },
  photo: {
    id: {
      type: String
    },
    url: {
      type: String
    }
  },
  unite: {
    type: Schema.Types.ObjectId,
    ref: "unites"
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "services"
  },
  // position: {
  //   type: String
  // },
  statut: {
    type: String,
    default: "membre"
  },
  password: {
    type: String
  }
});

mongoose.model("users", UserSchema);
