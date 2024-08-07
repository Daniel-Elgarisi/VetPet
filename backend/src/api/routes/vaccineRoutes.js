const express = require("express");
const router = express.Router();
const {
  getVaccines,
  getVaccinesNotifications,
} = require("../../controllers/vaccineController");

router.get("/get-vaccines/:pet_id/:dateofbirth", getVaccines);
router.get(
  "/get-vaccines-notifications/:pet_id/:pet_type",
  getVaccinesNotifications
);

module.exports = router;
