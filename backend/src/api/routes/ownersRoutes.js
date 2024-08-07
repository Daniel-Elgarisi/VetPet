const express = require("express");
const router = express.Router();
const {
  getOwners,
  editOwnersProfile,
  getOwnerDetails,
  getTransactionsForOwner,
} = require("../../controllers/ownersController");

router.get("/get-owners", getOwners);
router.post("/edit-ownersProfile/:id", editOwnersProfile);
router.get("/get-ownerInformation/:id", getOwnerDetails);
router.get("/get-transactionsForOwner/:id", getTransactionsForOwner);

module.exports = router;
