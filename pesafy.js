let unirest = require('unirest');
let req = unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
.headers({
	'Content-Type': 'application/json',
	'Authorization': 'Bearer B4inbajJAAjPIdoDclObwolYN0s4'
})
.send(JSON.stringify({
    "BusinessShortCode": 174379,
    "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjQwNTIyMTAxNDI0",
    "Timestamp": "20240522101424",
    "TransactionType": "CustomerPayBillOnline",
    "Amount": 1,
    "PartyA": 254717444970,
    "PartyB": 174379,
    "PhoneNumber": 254717444970,
    "CallBackURL": "https://mydomain.com/path",
    "AccountReference": "CompanyXLTD",
    "TransactionDesc": "Payment of X" 
  }))
.end(res => {
	if (res.error) throw new Error(res.error);
	console.log(res.raw_body);
});