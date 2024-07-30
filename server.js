const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Mock data to simulate a database or external service
let transactions = [];
let payments = [];
let transactionId = 1;
let paymentNo;

app.post('/payments', (req,res)=>{
    const { amount, sourceCurrency, targetCurrency, cell, access_tokens} = req.body;
    const newPayment = {
        amount,
        sourceCurrency,
        targetCurrency,
        cell, 
        access_tokens
    };
  
    // newPayment.push(payments)

    console.log("Number", payments);
    
//  console.log("Keys!!", consumer_secret);
 const short_code = process.env.SHORTCODE;
 const pass_key = process.env.PASSKEY;

 
  function getTimestamp() {
    const now = new Date();

    // If you need to convert to a specific timezone, do it here
    // Example for East Africa Time (UTC+3)
    const eastAfricaTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));

    const year = eastAfricaTime.getUTCFullYear();
    const month = String(eastAfricaTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(eastAfricaTime.getUTCDate()).padStart(2, '0');
    const hours = String(eastAfricaTime.getUTCHours()).padStart(2, '0');
    const minutes = String(eastAfricaTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(eastAfricaTime.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

  const password = Buffer.from(`${short_code}${pass_key}${getTimestamp()}`).toString('base64');
  // Step 2: Make STK Push Request
  const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  const payload = {
      BusinessShortCode: short_code,
      Password: password,
      Timestamp: getTimestamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount, // Amount to be charged
      PartyA: cell, // Customer's phone number
      PartyB: short_code,
      PhoneNumber: cell, // Customer's phone number
      CallBackURL: 'https://webhook.site/cbbe5d24-d30f-42e2-bd45-9daa051a39bc',
      AccountReference: 'Test123',
      TransactionDesc: 'Payment for testing'
  };

  console.log('Payload:', payload);

  axios.post(url, payload, {
      headers: {
          'Authorization': `Bearer ${access_tokens}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => {
      console.log('STK Push initiated successfully:', response.data);
  }).catch(error => {
  console.error('Error generating access token:', error);
});
res.json({paymentNo:newPayment.access_tokens});
})
app.post('/swap', (req, res) => {
    const { amount, sourceCurrency, targetCurrency, cell} = req.body;

    // Perform mock swap transaction (here, just store the transaction in memory)
    const newTransaction = {
        id: transactionId++,
        amount,
        sourceCurrency,
        targetCurrency,
        timestamp: new Date().toISOString(),
        cell
    };
    transactions.push(newTransaction);

    res.json({ transactionId: newTransaction.id });
});

// Endpoint to get all transactions
app.get('/transactions', (req, res) => {

        res.json(transactions);
});


app.listen(PORT, () => {
    console.log(` API server is running on port ${PORT}`);
});