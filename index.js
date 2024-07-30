require('dotenv').config();

// const got = require('got');
const axios = require('axios');
const { response } = require('express');

const consumer_key = process.env.CONSUMER_KEY;
 const consumer_secret = process.env.CONSUMER_SECRET;
 console.log("Keys!!", consumer_secret);
 const short_code = process.env.SHORTCODE;
 const pass_key = process.env.PASSKEY;

 axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
  headers: {
      'Authorization': `Basic ${Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64')}`
  }
})
.then(response => {
  const accessToken = response.data.access_token;
  console.log('Access Token:', accessToken);
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
      Amount: '1', // Amount to be charged
      PartyA: 254717444970, // Customer's phone number
      PartyB: short_code,
      PhoneNumber: 254717444970, // Customer's phone number
      CallBackURL: 'https://webhook.site/cbbe5d24-d30f-42e2-bd45-9daa051a39bc',
      AccountReference: 'Test123',
      TransactionDesc: 'Payment for testing'
  };

  console.log('Payload:', payload);

  axios.post(url, payload, {
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => {
      console.log('STK Push initiated successfully:', response.data);
  })
  .catch(error => {
      if (error.response) {
          console.error('Request failed with status code:', error.response.status);
          console.error('Response data:', error.response.data);
          if (error.response.data && error.response.data.Envelope) {
              console.error('Fault details:', error.response.data.Envelope.Body.Fault);
          }
      } else {
          console.error('Error initiating STK Push:', error.message);
      }
  });
})
.catch(error => {
  console.error('Error generating access token:', error);
});