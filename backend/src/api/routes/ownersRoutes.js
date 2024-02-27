const express = require("express");
const router = express.Router();
const {
  getOwners,
  editOwnersProfile,
  getOwnerDetails,
} = require("../../controllers/ownersController");

router.get("/get-owners", getOwners);
router.post("/edit-ownersProfile/:identity_number", editOwnersProfile);
router.get("/get-ownerInformation/:identity_number", getOwnerDetails);

module.exports = router;
