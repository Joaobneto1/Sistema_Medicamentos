const axios = require("axios");

const sendTelegramAlert = async (message) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown"
        });
        console.log("Mensagem enviada ao Telegram com sucesso.");
    } catch (error) {
        console.error("Erro ao enviar para o Telegram:", error.response?.data || error.message);
    }
};

module.exports = { sendTelegramAlert };