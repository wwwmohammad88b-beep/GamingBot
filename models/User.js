const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: Number, required: true, unique: true },
    username: String,
    firstName: String,
    warnings: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
