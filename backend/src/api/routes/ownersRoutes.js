const express = require("express");
const router = express.Router();
const {
  getOwners,
  editOwnersProfile,
} = require("../../controllers/ownersController");

router.get("/get-owners", getOwners);
router.post("/edit-ownersProfile", editOwnersProfile);

module.exports = router;
