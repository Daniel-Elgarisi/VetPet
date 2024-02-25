const pool = require("../../config/db");
const { sendEmail } = require("../../utils/emailService");

let otpStore = {};

const verifyIdAndSendCode = async (req, res) => {
  const { identity_number } = req.body;
  console.log("Owner ID:", identity_number);
  try {
    const result = await pool.query(
      "SELECT email FROM owners_profile WHERE identity_number = $1",
      [identity_number]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("ID not found");
    }
    const userEmail = result.rows[0].email;

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const expiry = Date.now() + 180000;
    otpStore[identity_number] = { code: verificationCode, expiry };
    // console.log("OTP store:", otpStore);
    console.log("Generated code:", verificationCode);

    const emailSent = await sendEmail(userEmail, verificationCode);
    if (emailSent) {
      console.log("Verification code sent via email.");
      res.status(200).json({ message: "Verification code sent via email" });
    } else {
      throw new Error("Failed to send email.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

module.exports = { verifyIdAndSendCode, otpStore };
