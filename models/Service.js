const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
  nom : {
    type: String
  },
  abreviation: {
    type: String
  },
  unite : {
    type: Schema.Types.ObjectId,
    ref: "unites"
  }
});

mongoose.model('services', ServiceSchema);