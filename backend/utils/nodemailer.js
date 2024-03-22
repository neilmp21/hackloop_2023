const nodemailer = require("nodemailer");
require("dotenv").config();

async function email(rmail, sub, body) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_NAME,
      pass: process.env.PASSWORD_EMAIL,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_NAME,
    to: rmail,
    subject: sub,
    text: body,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    console.log("Message sent: " + info.messageId);
  } catch (error) {
    console.log(error);
  }
}

// email("sayeem16ahmed76@gmail.com","env","is env folder scoped?");

module.exports = email;


// require('dotenv').config()
// console.log(process.env.DATABASE_URL); // remove this after you've confirmed it is working