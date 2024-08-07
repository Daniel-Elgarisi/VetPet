const express = require("express");
const router = express.Router();
const {
  verifyIdAndSendCode,
  otpStore,
  verifyVetIdAndSendCode,
} = require("../middlewares/verifyIdAndSendCode");

const {
  verifyOtpCode,
  verifyVetOtpCode,
} = require("../middlewares/verifyOtpCode");

router.post("/verify-id", verifyIdAndSendCode);
router.post("/verify-otp", verifyOtpCode);
router.post("/verify-vet-id", verifyVetIdAndSendCode);
router.post("/verify-vet-otp", verifyVetOtpCode);

module.exports = router;
