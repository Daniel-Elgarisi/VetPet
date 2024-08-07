const express = require("express");
const router = express.Router();
const { createPaymentIntent, captureOrder } = require("../../controllers/stripeController");

router.post("/create-payment-intent", createPaymentIntent);
router.post("/capture-order", captureOrder);

module.exports = router;
