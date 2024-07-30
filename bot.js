const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();
const validator = require('validator');

const validateNumeric = (str) => {
    return validator.isNumeric(str);
};

// Replace 'YOUR_BOT_TOKEN' with your actual bot token
const bot = new TelegramBot('7193861490:AAGhZZfEz5cXniPeUpoSbjVMFFa6eXaZ5i8', { polling: true });

// Define a command to start the bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome to the Swap Bot! Please enter the details of your swap transaction in this format: /swap phone number (in format 2547xxxxxxxx) amount source_currency target_currency");
});

// Handle user inputs for swap transactions
bot.onText(/\/swap (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const swapDetails = match[1].split(' ');
    const cell = swapDetails[0]
    
    const amount = parseFloat(swapDetails[1]);
    if(isNaN(amount) || amount <= 0){
        return bot.sendMessage(chatId, "Invalid amount. Please enter a positive number.");
    }
    
    if(cell.length > 12 || cell.length < 12){
        return bot.sendMessage(chatId,"Invalid Mpesa Cell No. Please enter a valid number.");
    }
    if(!validateNumeric(cell)){
        return bot.sendMessage(chatId,"Please enter a number without special characters and text.");
    }
    const sourceCurrency = swapDetails[2];
    const targetCurrency = swapDetails[3];

   
const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET;
//  console.log("Keys!!", consumer_secret);
//  const short_code = process.env.SHORTCODE;
//  const pass_key = process.env.PASSKEY;
axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
 headers: {
     'Authorization': `Basic ${Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')}`
 }
})
.then(response => {
    const access_tokens = response.data.access_token;
    console.log("Tokkeeeen", response.data.access_token);
//   response.data.access_token;
  axios.post('http://192.168.43.146:3000/payments', {
    
        amount,
        sourceCurrency,
        targetCurrency,
        cell,
        access_tokens

    
})
.then(response => {
    bot.sendMessage(chatId, `Payment Processing Ongoing: ${response.data.paymentNo}`)
    console.log('Request Sent Successfully:', response.data);
})
.catch(error => {
    if (error.response) {
        console.error('Request failed with status code:', error.response.status);
        console.error('Response data:', error.response.data);
        if (error.response.data && error.response.data.Envelope) {
            console.error('Fault details:', error.response.data.Envelope.Body.Fault);
        }
    } else {
        bot.sendMessage(chatId, `Error Initiating Payment: ${error.message}`)
        console.error('Error initiating STK Push:', error.message);
    }
});
})
});