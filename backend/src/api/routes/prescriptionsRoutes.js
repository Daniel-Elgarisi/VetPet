const express = require("express");
const router = express.Router();
const {
  getPrescriptionsDetail,
} = require("../../controllers/prescriptionsController");

router.get("/get-prescriptions-detail/:pet_id", getPrescriptionsDetail);

module.exports = router;
