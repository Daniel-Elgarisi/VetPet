const express = require("express");
const router = express.Router();
const {
  createOrder,
  captureOrder,
  updateSubscription,
} = require("../../controllers/paypalController");

router.post("/create-order/:id/:pet_id", createOrder);
router.post("/capture-order", captureOrder);
router.put("/update-subscription/:pet_id", updateSubscription);

module.exports = router;
