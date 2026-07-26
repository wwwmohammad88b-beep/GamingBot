// رویدادهای گروه: عضویت ربات در گروه جدید و خوش‌آمدگویی به اعضا
const Settings = require("../models/Settings");

module.exports = (bot) => {
  bot.on("new_chat_members", async (msg) => {
    try {
      const chatId = msg.chat.id;
      const botAdded = !!bot.me && msg.new_chat_members.some((m) => m.id === bot.me.id);

      if (botAdded) {
        Settings.findOneAndUpdate({ chatId }, { $setOnInsert: { chatId } }, { upsert: true }).catch(
          (err) => console.error("خطا در ثبت تنظیمات گروه (دیتابیس وصل نیست؟):", err.message)
        );
        return bot.sendMessage(
          chatId,
          "سلام! من ربات مدیریت گروه گیمینگ شما هستم 🎮\nبرای دیدن دستورات از /help استفاده کنید."
        );
      }

      const names = msg.new_chat_members
        .filter((m) => !m.is_bot)
        .map((m) => m.first_name)
        .join("، ");
      if (names) {
        bot.sendMessage(chatId, `${names} به گروه خوش اومدی! 🎮`);
      }
    } catch (err) {
      console.error("خطا در رویداد عضو جدید:", err.message);
    }
  });
};
