const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AffectationSchema = new Schema({
  reference: {
    type: String
  },
  date: {
    type: Date
  },
  unite: {
    type: Schema.Types.ObjectId,
    ref: "unites"
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "services"
  },
  fonction: {
    type: String
  },
  user: { 
    type: Schema.Types.ObjectId,
    ref: "users"
  }
});

mongoose.model("affectations", AffectationSchema);
