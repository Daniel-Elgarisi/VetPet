const express = require("express");
const router = express.Router();
const { getPetsByOwnerId } = require("../../controllers/petsController");

router.get("/get-pets/:id", getPetsByOwnerId);

module.exports = router;
