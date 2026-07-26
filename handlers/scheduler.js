// زمان‌بندی ارسال خودکار اخبار گیم با node-cron
const cron = require("node-cron");
const Settings = require("../models/Settings");
const { fetchGamingNews, formatNewsMessage } = require("./news");

module.exports = (bot) => {
  // هر ساعت، دقیقه صفر
  cron.schedule("0 * * * *", async () => {
    try {
      const enabledChats = await Settings.find({ newsEnabled: true });
      if (!enabledChats.length) return;

      const items = await fetchGamingNews();
      const message = formatNewsMessage(items);

      for (const settings of enabledChats) {
        try {
          await bot.sendMessage(settings.chatId, message, { parse_mode: "HTML" });
        } catch (err) {
          console.error(`خطا در ارسال خبر به ${settings.chatId}:`, err.message);
        }
      }
    } catch (err) {
      console.error("خطا در اجرای زمان‌بند اخبار:", err.message);
    }
  });

  console.log("زمان‌بند اخبار گیم فعال شد (هر ساعت)");
};
