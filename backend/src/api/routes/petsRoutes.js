const express = require("express");
const router = express.Router();
const {
  getPetsByOwnerId,
  getFullPetInformation,
} = require("../../controllers/petsController");

router.get("/get-pets/:id", getPetsByOwnerId);
router.get("/get-fullPetInformation/:id", getFullPetInformation);

module.exports = router;
