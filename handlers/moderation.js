// منطق مدیریت گروه: ban / kick / mute / unmute / warn
const User = require("../models/User");
const Settings = require("../models/Settings");

async function isGroupAdmin(bot, chatId, userId) {
  try {
    const member = await bot.getChatMember(chatId, userId);
    return member.status === "administrator" || member.status === "creator";
  } catch (err) {
    return false;
  }
}

function getTargetUserId(msg) {
  if (msg.reply_to_message && msg.reply_to_message.from) {
    return msg.reply_to_message.from.id;
  }
  return null;
}

async function banUser(bot, chatId, userId) {
  await bot.banChatMember(chatId, userId);
}

async function kickUser(bot, chatId, userId) {
  await bot.banChatMember(chatId, userId);
  await bot.unbanChatMember(chatId, userId);
}

async function muteUser(bot, chatId, userId, minutes) {
  const permissions = {
    can_send_messages: false,
    can_send_media_messages: false,
    can_send_polls: false,
    can_send_other_messages: false,
    can_add_web_page_previews: false,
  };
  const options = { permissions };
  if (minutes) {
    options.until_date = Math.floor(Date.now() / 1000) + minutes * 60;
  }
  await bot.restrictChatMember(chatId, userId, options);
}

async function unmuteUser(bot, chatId, userId) {
  const permissions = {
    can_send_messages: true,
    can_send_media_messages: true,
    can_send_polls: true,
    can_send_other_messages: true,
    can_add_web_page_previews: true,
  };
  await bot.restrictChatMember(chatId, userId, { permissions });
}

async function warnUser(bot, chatId, userId) {
  const settings = await Settings.findOne({ chatId });
  const warnLimit = (settings && settings.warnLimit) || 3;

  const user = await User.findOneAndUpdate(
    { telegramId: userId },
    { $inc: { warnings: 1 }, $setOnInsert: { telegramId: userId } },
    { upsert: true, new: true }
  );

  if (user.warnings >= warnLimit) {
    await banUser(bot, chatId, userId);
    await User.updateOne({ telegramId: userId }, { warnings: 0, isBanned: true });
    return { banned: true, warnings: user.warnings, warnLimit };
  }

  return { banned: false, warnings: user.warnings, warnLimit };
}

module.exports = {
  isGroupAdmin,
  getTargetUserId,
  banUser,
  kickUser,
  muteUser,
  unmuteUser,
  warnUser,
};
