require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Load environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const exchangeApiKey = process.env.EXCHANGE_API_KEY;
const swapApiKey = process.env.SWAP_API_KEY;

// Initialize the bot
const bot = new TelegramBot(token, { polling: true });

// Function to get exchange rate
async function getExchangeRate(sourceCrypto, targetCrypto) {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: sourceCrypto,
                vs_currencies: targetCrypto
            }
        });
        return response.data[sourceCrypto][targetCrypto];
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw new Error('Could not fetch exchange rate.');
    }
}

// Function to perform swap
async function performSwap(userId, sourceCrypto, targetCrypto, amount) {
    try {
        const response = await axios.post('https://api.example.com/v1/swap', {
            userId,
            from: sourceCrypto,
            to: targetCrypto,
            amount
        }, {
            headers: { 'Authorization': `Bearer ${swapApiKey}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error performing swap:', error);
        throw new Error('Swap transaction failed.');
    }
}

// Command handlers
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the Crypto Swap Bot! Use /swap to initiate a transaction.");
});

bot.onText(/\/swap (.+) (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const sourceCrypto = match[1].toLowerCase().trim();
    const targetCrypto = match[2].toLowerCase().trim();
    const amount = parseFloat(match[3]);

    if (isNaN(amount) || amount <= 0) {
        return bot.sendMessage(chatId, "Invalid amount. Please enter a positive number.");
    }

    try {
        const rate = await getExchangeRate(sourceCrypto, targetCrypto);
        bot.sendMessage(chatId, `The exchange rate from ${sourceCrypto} to ${targetCrypto} is ${rate}. Confirm swap? (yes/no)`);

        bot.once('message', async (confirmMsg) => {
            if (confirmMsg.text.toLowerCase() === 'yes') {
                try {
                    const swapResult = await performSwap(chatId, sourceCrypto, targetCrypto, amount);
                    bot.sendMessage(chatId, `Swap successful! Transaction ID: ${swapResult.transactionId}`);
                } catch (error) {
                    bot.sendMessage(chatId, `Error: ${error.message}`);
                }
            } else {
                bot.sendMessage(chatId, "Swap cancelled.");
            }
        });
    } catch (error) {
        bot.sendMessage(chatId, `Error: ${error.message}`);
    }
});