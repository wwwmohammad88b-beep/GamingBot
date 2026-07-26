// مدیریت پیام‌های عادی: ثبت کاربر، پاسخ خودکار آموزش‌داده‌شده، و در نبود آن، هوش مصنوعی
const User = require("../models/User");
const { findReply } = require("../handlers/autoReply");
const { askAI } = require("../handlers/aiHandler");

module.exports = (bot) => {
  bot.on("message", async (msg) => {
    try {
      if (!msg.text || msg.text.startsWith("/")) return; // دستورات جای دیگه هندل می‌شن

      const chatId = msg.chat.id;
      const userId = msg.from.id;

      // ثبت کاربر - اگه دیتابیس وصل نباشه فقط لاگ می‌کنیم و ادامه می‌دیم
      User.findOneAndUpdate(
        { telegramId: userId },
        { telegramId: userId, username: msg.from.username, firstName: msg.from.first_name },
        { upsert: true }
      ).catch((err) => console.error("خطا در ثبت کاربر (دیتابیس وصل نیست؟):", err.message));

      const learned = await findReply(chatId, msg.text);
      if (learned) {
        return bot.sendMessage(chatId, learned);
      }

      const isPrivate = msg.chat.type === "private";
      const botUsername = bot.me ? bot.me.username : null;
      const mentioned = botUsername ? msg.text.includes(`@${botUsername}`) : false;
      const isReplyToBot =
        !!bot.me && !!msg.reply_to_message && msg.reply_to_message.from.id === bot.me.id;

      if (isPrivate || mentioned || isReplyToBot) {
        const question = botUsername ? msg.text.replace(`@${botUsername}`, "").trim() : msg.text;
        const answer = await askAI(question);
        return bot.sendMessage(chatId, answer, { reply_to_message_id: msg.message_id });
      }
    } catch (err) {
      console.error("خطا در پردازش پیام:", err.message);
    }
  });
};
