// ساخت و مقداردهی اولیه نمونه ربات تلگرام (حالت وب‌هوک - بدون polling)
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN);

// اطلاعات خود ربات (یوزرنیم و آیدی) رو یک بار می‌گیریم و کش می‌کنیم
bot.getMe()
  .then((me) => {
    bot.me = me;
    console.log(`ربات با نام @${me.username} آماده است`);
  })
  .catch((err) => {
    console.error("خطا در دریافت اطلاعات ربات (getMe):", err.message);
  });

module.exports = bot;
