// دستور /help
const { isGroupAdmin } = require("../handlers/moderation");

module.exports = (bot) => {
  bot.onText(/^\/help(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    let text =
      "📋 دستورات عمومی:\n" +
      "/start - شروع کار با ربات\n" +
      "/help - نمایش همین راهنما\n\n" +
      "💬 هر سوالی داشته باشی می‌تونی بپرسی، ربات با هوش مصنوعی جواب می‌ده.";

    const isAdmin =
      msg.chat.type !== "private" && (await isGroupAdmin(bot, chatId, msg.from.id));

    if (isAdmin) {
      text +=
        "\n\n🛡 دستورات مدیریتی (روی پیام کاربر ریپلای کن و بنویس):\n" +
        "/ban - بن کردن کاربر\n" +
        "/kick - اخراج کاربر از گروه\n" +
        "/mute [دقیقه] - سایلنت کردن (بدون عدد یعنی نامحدود)\n" +
        "/unmute - رفع سایلنت\n" +
        "/warn - ثبت اخطار (بعد از رسیدن به سقف، بن خودکار)\n\n" +
        "🎓 آموزش پاسخ خودکار:\n" +
        "/learn\nسوال: <متن>\nجواب: <متن>\n\n" +
        "📰 اخبار گیم:\n" +
        "/news on | off | now";
    }

    bot.sendMessage(chatId, text);
  });
};
