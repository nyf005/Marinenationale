const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TrainingSchema = new Schema({
  equivalent : {
    type: String
  },
  intitule : {
    type: String
  },
  ecole: {
    type: String
  },
  ville: {
    type: String
  },
  pays: {
    type: String
  },
  date_debut: {
    type: Date
  },
  date_fin: {
    type: Date
  },
  scan_diplome: {
    id: {
      type: String
    },
    url: {
      type: String
    },
    format: {
      type: String
    }
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
});

mongoose.model('trainings', TrainingSchema);