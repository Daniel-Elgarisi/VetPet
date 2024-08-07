const express = require("express");
const router = express.Router();
const {
  getReferencesDetail,
} = require("../../controllers/referencesController");

router.get("/get-references/:pet_id", getReferencesDetail);

module.exports = router;
