const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "d603988f9d8ba8",
    pass: "09f8e52fe715c2",
  },
});

// Secret key for JWT
const secretKey = "div9ghfjf768cjhgj9"; 
module.exports = transporter;