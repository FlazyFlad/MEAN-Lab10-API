const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('7056871750:AAGKdB1aLj_fHZ4zjU4vVtOeDIhGqxiAHcc', { polling: false });

const sendTelegramMessage = async (chatId, message) => {
  try {
    await bot.sendMessage(chatId, message);
    console.log(`Message sent to Telegram chat ${chatId}`);
  } catch (error) {
    console.error(`Error sending message to Telegram: ${error.message}`);
  }
};

module.exports = { sendTelegramMessage };
