const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    chatId: { type: Number, required: true, unique: true },
    newsEnabled: { type: Boolean, default: false },
    warnLimit: { type: Number, default: 3 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
