const nodemailer = require("nodemailer");

const sendEmail = async (toEmail, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // For testing purposes; consider using a more secure method for production
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });
  console.log("Email pass:", process.env.EMAIL_PASSWORD);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendEmail };
