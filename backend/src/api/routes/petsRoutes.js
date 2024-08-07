const express = require("express");
const router = express.Router();
const {
  getPetsByOwnerId,
  getFullPetInformation,
  getSubscriptionPetsByOwnerId,
  cancelPetSubscription,
  getPotentialPetSubscriptionsByOwnerId,
} = require("../../controllers/petsController");

router.get("/get-pets/:id", getPetsByOwnerId);
router.get("/get-fullPetInformation/:pet_id", getFullPetInformation);
router.get("/get-pets-subscription/:id", getSubscriptionPetsByOwnerId);
router.put("/cancel-pet-subscription/:pet_id", cancelPetSubscription);
router.get(
  "/get-potential-pets-subscription/:id",
  getPotentialPetSubscriptionsByOwnerId
);

module.exports = router;
