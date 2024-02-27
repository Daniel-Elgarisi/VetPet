const { otpStore } = require("./verifyIdAndSendCode");

const verifyOtpCode = async (req, res) => {
  const { code, identity_number } = req.body;

  let storedData = otpStore[identity_number];
  if (!storedData) {
    return res
      .status(404)
      .send({ message: "לא נמצאו נתוני אימות או שתוקף קוד האימות פג." });
  }

  if (Date.now() > storedData.expiry) {
    return res.status(408).send({ message: "תוקף קוד האימות פג." });
  }

  if (code === storedData.code.toString()) {
    res.status(200).send({
      message: "הקוד אומת בהצלחה, מתחבר...",
      ownerId: identity_number,
    });
    delete otpStore[identity_number];
  } else {
    res.status(400).send({ message: "קוד אימות לא חוקי." });
  }
};

module.exports = verifyOtpCode;
