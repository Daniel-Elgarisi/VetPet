const express = require("express");
const router = express.Router();
const {
  editVetsProfile,
  getVetDetails,
} = require("../../controllers/vetController");

router.post("/edit-vetsProfile/:id", editVetsProfile);
router.get("/get-VetInformation/:id", getVetDetails);

module.exports = router;
