const { otpStore } = require("./verifyIdAndSendCode");

const verifyOtpCode = async (req, res) => {
  const { code, identity_number } = req.body;

  const storedData = otpStore[identity_number];
  if (!storedData) {
    return res.status(404).send("Verification data not found or code expired.");
  }

  if (Date.now() > storedData.expiry) {
    delete otpStore[identity_number];
    return res.status(408).send("Code expired.");
  }

  if (code === storedData.code.toString()) {
    res.status(200).send("Code verified successfully");
    delete otpStore[identity_number];
  } else {
    res.status(400).send("Invalid code");
  }
};

module.exports = verifyOtpCode;
