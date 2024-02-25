const nodemailer = require("nodemailer");

const sendEmail = async (toEmail, verificationCode) => {
  // console.log("Sending email to:", toEmail);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // App Engine email user
      pass: process.env.EMAIL_PASSWORD, // App Engine email pass
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Verification Code",
    text: `Your verification code is: ${verificationCode}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendEmail };
