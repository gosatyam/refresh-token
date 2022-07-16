const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
  },
  {
    timestamps: true,
  }
);

const SessionModel = mongoose.model("Session", SessionSchema);
module.exports = SessionModel;
