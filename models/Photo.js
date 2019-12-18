const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
  titre: {
    type: String
  },
  description: {
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
  }
});

mongoose.model("photos", PhotoSchema);
