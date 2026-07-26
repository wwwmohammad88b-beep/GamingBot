// دستورات مخصوص مدیر: مدیریت گروه، آموزش پاسخ، اخبار، و پنل مدیریت
const mongoose = require("mongoose");
const Settings = require("../models/Settings");
const User = require("../models/User");
const Reply = require("../models/Reply");
const {
  isGroupAdmin,
  getTargetUserId,
  banUser,
  kickUser,
  muteUser,
  unmuteUser,
  warnUser,
} = require("../handlers/moderation");
const { saveReply } = require("../handlers/autoReply");
const { fetchGamingNews, formatNewsMessage } = require("../handlers/news");

const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function isSuperAdmin(userId) {
  return ADMIN_IDS.includes(String(userId));
}

module.exports = (bot) => {
  // /ban
  bot.onText(/^\/ban(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
      return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
    }
    const targetId = getTargetUserId(msg);
    if (!targetId) {
      return bot.sendMessage(chatId, "روی پیام کاربر موردنظر ریپلای کن و بنویس /ban");
    }
    try {
      await banUser(bot, chatId, targetId);
      bot.sendMessage(chatId, "کاربر بن شد 🚫");
    } catch (err) {
      bot.sendMessage(chatId, "خطا در بن کردن کاربر: " + err.message);
    }
  });

  // /kick
  bot.onText(/^\/kick(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
      return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
    }
    const targetId = getTargetUserId(msg);
    if (!targetId) {
      return bot.sendMessage(chatId, "روی پیام کاربر موردنظر ریپلای کن و بنویس /kick");
    }
    try {
      await kickUser(bot, chatId, targetId);
      bot.sendMessage(chatId, "کاربر از گروه اخراج شد 👢");
    } catch (err) {
      bot.sendMessage(chatId, "خطا در اخراج کاربر: " + err.message);
    }
  });

  // /mute [دقیقه]
  bot.onText(/^\/mute(?:@\w+)?(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
      return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
    }
    const targetId = getTargetUserId(msg);
    if (!targetId) {
      return bot.sendMessage(chatId, "روی پیام کاربر موردنظر ریپلای کن و بنویس /mute");
    }
    const minutes = match[1] ? parseInt(match[1], 10) : null;
    try {
      await muteUser(bot, chatId, targetId, minutes);
      bot.sendMessage(
        chatId,
        minutes ? `کاربر برای ${minutes} دقیقه سایلنت شد 🔇` : "کاربر سایلنت شد 🔇"
      );
    } catch (err) {
      bot.sendMessage(chatId, "خطا در سایلنت کردن کاربر: " + err.message);
    }
  });

  // /unmute
  bot.onText(/^\/unmute(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
      return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
    }
    const targetId = getTargetUserId(msg);
    if (!targetId) {
      return bot.sendMessage(chatId, "روی پیام کاربر موردنظر ریپلای کن و بنویس /unmute");
    }
    try {
      await unmuteUser(bot, chatId, targetId);
      bot.sendMessage(chatId, "سایلنت کاربر برداشته شد 🔊");
    } catch (err) {
      bot.sendMessage(chatId, "خطا در رفع سایلنت: " + err.message);
    }
  });

  // /warn
  bot.onText(/^\/warn(?:@\w+)?/, async (msg) => {
    const chatId = msg.chat.id;
    if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
      return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
    }
    const targetId = getTargetUserId(msg);
    if (!targetId) {
      return bot.sendMessage(chatId, "روی پیام کاربر موردنظر ریپلای کن و بنویس /warn");
    }
    try {
      const result = await warnUser(bot, chatId, targetId);
      if (result.banned) {
        bot.sendMessage(chatId, `کاربر به سقف ${result.warnLimit} اخطار رسید و بن شد 🚫`);
      } else {
        bot.sendMessage(chatId, `اخطار ثبت شد (${result.warnings}/${result.warnLimit}) ⚠️`);
      }
    } catch (err) {
      bot.sendMessage(chatId, "خطا در ثبت اخطار: " + err.message);
    }
  });

  // /learn (فرمت کامل با سوال و جواب)
  bot.onText(
    /^\/learn[\s\S]*?سوال\s*:\s*([\s\S]+?)\n\s*جواب\s*:\s*([\s\S]+)/,
    async (msg, match) => {
      const chatId = msg.chat.id;
      if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
        return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
      }
      const question = match[1].trim();
      const answer = match[2].trim();
      try {
        await saveReply(chatId, question, answer, msg.from.id);
        bot.sendMessage(chatId, `یاد گرفتم ✅\nسوال: ${question}\nجواب: ${answer}`);
      } catch (err) {
        bot.sendMessage(chatId, "خطا در ذخیره پاسخ: " + err.message);
      }
    }
  );

  // /learn بدون فرمت کامل -> راهنمایی
  bot.onText(/^\/learn(?:@\w+)?\s*$/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "فرمت درست:\n/learn\nسوال: <متن سوال>\nجواب: <متن جواب>"
    );
  });

  // /news on|off|now
  bot.onText(/^\/news(?:@\w+)?\s+(on|off|now)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!(await isGroupAdmin(bot, chatId, msg.from.id))) {
      return bot.sendMessage(chatId, "این دستور فقط برای مدیرهای گروهه ⛔");
    }
    const action = match[1];

    if (action === "now") {
      bot.sendMessage(chatId, "در حال دریافت اخبار...");
      const items = await fetchGamingNews();
      const text = formatNewsMessage(items);
      return bot.sendMessage(chatId, text, { parse_mode: "HTML" });
    }

    return bot.sendMessage(
      chatId,
      "ارسال خودکار ساعتی فعلاً برای سبک نگه داشتن ربات غیرفعاله؛ هر وقت خواستی با /news now می‌تونی دستی بگیری."
    );
  });

  // /panel - فقط سوپرادمین‌های ربات (ADMIN_IDS در .env)
  bot.onText(/^\/panel(?:@\w+)?/, (msg) => {
    const chatId = msg.chat.id;
    if (!isSuperAdmin(msg.from.id)) {
      return bot.sendMessage(chatId, "این دستور فقط برای ادمین‌های ربات قابل مشاهده‌ست ⛔");
    }
    bot.sendMessage(chatId, "🎛 پنل مدیریت ربات", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 آمار ربات", callback_data: "panel_stats" }],
          [{ text: "📰 وضعیت اخبار این گروه", callback_data: "panel_news" }],
          [{ text: "📚 تعداد پاسخ‌های آموزش‌داده‌شده", callback_data: "panel_replies" }],
          [{ text: "⚙️ وضعیت سرویس‌ها", callback_data: "panel_status" }],
        ],
      },
    });
  });

  // دکمه‌های پنل
  bot.on("callback_query", async (query) => {
    if (!query.data || !query.data.startsWith("panel_")) return;

    if (!isSuperAdmin(query.from.id)) {
      return bot.answerCallbackQuery(query.id, { text: "دسترسی نداری ⛔", show_alert: true });
    }

    const chatId = query.message.chat.id;

    try {
      if (query.data === "panel_stats") {
        const userCount = await User.countDocuments();
        const groupCount = await Settings.countDocuments();
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, `👥 تعداد کاربران: ${userCount}\n💬 تعداد گروه‌های ثبت‌شده: ${groupCount}`);
      }

      if (query.data === "panel_news") {
        const settings = await Settings.findOne({ chatId });
        const status = settings && settings.newsEnabled ? "فعال ✅" : "غیرفعال ❌";
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, `وضعیت اخبار این گروه: ${status}`);
      }

      if (query.data === "panel_replies") {
        const replyCount = await Reply.countDocuments();
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, `📚 تعداد پاسخ‌های آموزش‌داده‌شده: ${replyCount}`);
      }
    } catch (err) {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, "دیتابیس وصل نیست، این بخش فعلاً در دسترس نیست.");
    }

    if (query.data === "panel_status") {
      const dbConnected = mongoose.connection.readyState === 1;
      const aiConfigured = /^sk-/.test(process.env.OPENAI_API_KEY || "");
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(
        chatId,
        "⚙️ وضعیت سرویس‌ها:\n" +
          `🗄 دیتابیس (MongoDB): ${dbConnected ? "وصل ✅" : "وصل نیست ❌"}\n` +
          `🤖 هوش مصنوعی (OpenAI): ${aiConfigured ? "تنظیم شده ✅" : "کلید تنظیم نشده ❌"}`
      );
    }
  });
};
