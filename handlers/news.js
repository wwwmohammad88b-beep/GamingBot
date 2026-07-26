// دریافت اخبار گیم از فیدهای RSS و آماده‌سازی متن پیام
const Parser = require("rss-parser");
const parser = new Parser();

// نکته: این فیدها رو بعد از تست اولیه بررسی کن و در صورت نیاز جایگزین/اضافه کن
const FEEDS = [
  "https://www.pcgamer.com/rss/",
  "https://feeds.ign.com/ign/games-all",
  "https://www.eurogamer.net/feed",
];

async function fetchGamingNews(limitPerFeed = 3) {
  const items = [];

  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.slice(0, limitPerFeed).forEach((item) => {
        items.push({ title: item.title, link: item.link });
      });
    } catch (err) {
      console.error(`خطا در دریافت فید ${url}:`, err.message);
    }
  }

  return items;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatNewsMessage(items) {
  if (!items.length) {
    return "🎮 <b>Gaming News</b>\n\nفعلاً خبر جدیدی پیدا نشد.";
  }
  const lines = items
    .map((item) => `• <a href="${item.link}">${escapeHtml(item.title)}</a>`)
    .join("\n");
  return `🎮 <b>Gaming News</b>\n\n${lines}`;
}

module.exports = { fetchGamingNews, formatNewsMessage };
