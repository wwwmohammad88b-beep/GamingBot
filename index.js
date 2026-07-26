require("dotenv").config();
const express = require("express");

const connectDB = require("./config/database");
const bot = require("./config/bot");

connectDB();

require("./events/message")(bot);
require("./events/group")(bot);
require("./commands/start")(bot);
require("./commands/help")(bot);
require("./commands/admin")(bot);

// اخبار خودکار ساعتی فعلاً غیرفعاله تا اجرا سبک‌تر بمونه.
// برای فعال‌سازی دوباره: npm install node-cron و از این خط کامنت بردار:
// require("./handlers/scheduler")(bot);

const app = express();
app.use(express.json());

const WEBHOOK_PATH = `/webhook/${process.env.BOT_TOKEN}`;

// تلگرام آپدیت‌ها رو با POST به همین مسیر می‌فرسته
app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// یه صفحه ساده که نشون می‌ده سرویس بالاست (برای چک کردن با مرورگر)
app.get("/", (req, res) => {
  res.send("GamingBot در حال اجراست ✅");
});

// این آدرس رو فقط یک بار، بعد از دیپلوی، تو مرورگر باز کن تا وب‌هوک ست بشه
app.get("/set-webhook", async (req, res) => {
  try {
    const url = `https://${req.get("host")}${WEBHOOK_PATH}`;;
    await bot.setWebHook(url);
    res.send(`وب‌هوک با موفقیت روی این آدرس تنظیم شد:\n${url}`);
  } catch (err) {
    res.status(500).send("خطا در تنظیم وب‌هوک: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot Started...");
  console.log(`سرور روی پورت ${PORT} در حال اجراست`);
});
