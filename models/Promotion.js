const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PromotionSchema = new Schema({
  reference: {
    type: String
  },
  date: {
    type: Date
  },
  grade: {
    type: Schema.Types.ObjectId,
    ref: "ranks"
  },
//   scan_justificatif: {
//     id: {
//       type: String
//     },
//     url: {
//       type: String
//     },
//     format: {
//       type: String
//     }
//   },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  }
});

mongoose.model("promotions", PromotionSchema);
