const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActualiteSchema = new Schema({
  titre : {
    type: String
  },
  texte : {
    type: String
  },
  image: {
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
  date_publication:{
    type: Date
  }
});

mongoose.model('actualites', ActualiteSchema);