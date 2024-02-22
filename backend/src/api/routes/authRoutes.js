const express = require("express");
const router = express.Router();
const {
  verifyIdAndSendCode,
  otpStore,
} = require("../middlewares/verifyIdAndSendCode");
const verifyOtpCode = require("../middlewares/verifyOtpCode");

router.post("/verify-id", verifyIdAndSendCode);
router.post("/verify-otp", verifyOtpCode);

module.exports = router;
