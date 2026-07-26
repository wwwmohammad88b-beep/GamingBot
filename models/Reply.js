const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    chatId: { type: Number, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdBy: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reply", replySchema);
