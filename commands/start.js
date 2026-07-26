// دستور /start
module.exports = (bot) => {
  bot.onText(/^\/start(?:@\w+)?/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "سلام! 🎮 به ربات گیمینگ خوش اومدی.\nبرای دیدن لیست دستورات از /help استفاده کن."
    );
  });
};
