const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InformationSchema = new Schema({
  reference : {
    type: String
  },
  objet : {
    type: String
  },
  commentaire : {
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
  date_expiration:{
    type: Date
  },
  date_ajout:{
    type: Date
  },
  proprio: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
});

mongoose.model('informations', InformationSchema);