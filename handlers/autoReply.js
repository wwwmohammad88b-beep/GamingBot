// منطق پاسخ‌های خودکار (خواندن و ذخیره‌سازی پاسخ‌های آموزش‌داده‌شده)
const Reply = require("../models/Reply");
const { escapeRegex } = require("../utils/functions");

async function findReply(chatId, text) {
  const question = text.trim();
  if (!question) return null;
  try {
    const reply = await Reply.findOne({
      chatId,
      question: new RegExp(`^${escapeRegex(question)}$`, "i"),
    });
    return reply ? reply.answer : null;
  } catch (err) {
    console.error("خطا در خواندن پاسخ‌های آموزش‌داده‌شده (دیتابیس وصل نیست؟):", err.message);
    return null;
  }
}

async function saveReply(chatId, question, answer, createdBy) {
  return Reply.findOneAndUpdate(
    { chatId, question: question.trim() },
    { chatId, question: question.trim(), answer: answer.trim(), createdBy },
    { upsert: true, new: true }
  );
}

module.exports = { findReply, saveReply };
