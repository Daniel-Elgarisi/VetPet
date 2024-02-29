const express = require("express");
const router = express.Router();
const {
  getOwners,
  editOwnersProfile,
  getOwnerDetails,
} = require("../../controllers/ownersController");

router.get("/get-owners", getOwners);
router.post("/edit-ownersProfile/:id", editOwnersProfile);
router.get("/get-ownerInformation/:id", getOwnerDetails);

module.exports = router;
