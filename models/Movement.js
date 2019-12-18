const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MovementSchema = new Schema({
  reference: {
    type: String
  },
  type: {
    type: String
  },
  objet: {
    type: String
  },
  ville: {
    type: String
  },
  pays: {
    type: String
  },
  date_depart: {
    type: Date
  },
  date_fin: {
    type: Date
  },
  scan_justificatif: {
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
  }
});

mongoose.model("movements", MovementSchema);
