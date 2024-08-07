const express = require("express");
const router = express.Router();
const {
  getVaccinesNotificationsCount,
  getFutureAppointmentsCountForOwnerInNext3Days,
  getSubscriptionPetsCountByOwnerId,
  getTotalNotificationsCount,
} = require("../../controllers/notificationsCountController");

router.get(
  "/get-vaccines-notifications-count/:pet_id/:pet_type",
  getVaccinesNotificationsCount
);
router.get(
  "/get-future-appointments-count/:id",
  getFutureAppointmentsCountForOwnerInNext3Days
);

router.get(
  "/get-pets-subscription-count/:id",
  getSubscriptionPetsCountByOwnerId
);

router.get("/get-total-notifications-count/:id", getTotalNotificationsCount);

module.exports = router;
