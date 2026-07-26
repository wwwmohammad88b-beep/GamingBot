// توابع کمکی مشترک پروژه

// فرار دادن کاراکترهای خاص برای استفاده امن در RegExp
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isPrivateChat(msg) {
  return msg.chat.type === "private";
}

module.exports = { escapeRegex, isPrivateChat };
