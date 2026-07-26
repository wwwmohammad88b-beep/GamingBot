// اتصال به دیتابیس MongoDB با Mongoose
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ اتصال به MongoDB برقرار شد");
  } catch (err) {
    console.error("⚠️  اتصال به MongoDB برقرار نشد:", err.message);
    console.error(
      "⚠️  ربات بدون دیتابیس اجرا می‌شه؛ /start و /help و /ban و /kick و /mute و /unmute کار می‌کنن، ولی /learn و /warn و /news و /panel و پاسخ‌های آموزش‌داده‌شده تا وصل شدن دیتابیس کار نمی‌کنن."
    );
  }
}

module.exports = connectDB;
