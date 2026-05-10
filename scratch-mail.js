const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4, // <-- Force IPv4
  auth: {
    user: 'test',
    pass: 'test',
  },
});

console.log(transporter.options);
