const { otpStore } = require("./verifyIdAndSendCode");

const verifyOtpCode = async (req, res) => {
  const { code, identity_number } = req.body;

  let storedData = otpStore[identity_number];
  if (!storedData) {
    return res.status(404).send({ message: "Verification data not found." });
  }

  if (Date.now() > storedData.expiry) {
    return res.status(408).send({ message: "Code expired." });
  }

  if (code === storedData.code.toString()) {
    res.status(200).send({
      message: "Code verified successfully",
      ownerId: identity_number,
    });
    delete otpStore[identity_number];
  } else {
    res.status(400).send({ message: "Invalid code" });
  }
};

module.exports = verifyOtpCode;
