const express = require("express");
const router = express.Router();
const { getRecords } = require("../../controllers/recordsController");

router.get("/get-records/:pet_id", getRecords);

module.exports = router;
