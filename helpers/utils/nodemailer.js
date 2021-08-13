var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: process.env.AUTH_USER,
           pass: process.env.AUTH_PASS
       }
   });

  module.exports = {transporter};