// ارتباط با هوش مصنوعی برای پاسخ به سوالات کاربران
const openai = require("../config/ai");

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

async function askAI(question) {
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "تو دستیار متخصص گیم و سخت‌افزار هستی که داخل یک ربات تلگرام فارسی‌زبان به اعضای یک گروه گیمینگ کمک می‌کنی. کوتاه، دقیق و دوستانه جواب بده.",
        },
        { role: "user", content: question },
      ],
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("خطای هوش مصنوعی:", err.message);
    return "الان نمی‌تونم جواب بدم، یکم بعد دوباره امتحان کن 🙏";
  }
}

module.exports = { askAI };
