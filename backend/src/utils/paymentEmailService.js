const nodemailer = require("nodemailer");

const sendPaymentConfirmationEmail = async (
  toEmail,
  amount,
  userName,
  petName,
  transactionId
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = `
    <div style="direction: rtl; text-align: right;">
    ${userName} שלום,<br>
    התשלום שלך בסך: ${amount}₪ עבור חידוש מנוי של ${petName} התקבל בהצלחה.<br>
    מספר מזהה העסקה: ${transactionId}
    הקבלה זמינה כעת לצפייה והורדה ישירות באפליקציה.<br>
    תודה 🐾
    </div>`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "אישור תשלום",
    html: message,
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

module.exports = { sendPaymentConfirmationEmail };
