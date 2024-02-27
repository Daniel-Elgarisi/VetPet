const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentsForSinglePet,
  getAppointmentsByOwner,
  getNonAvailableAppointmentsForDay,
  deleteAppointment,
} = require("../../controllers/appointmentsController");

router.post("/create-appointment", createAppointment);
router.get("/get-appointments/:id", getAppointmentsForSinglePet);
router.get("/get-appointmentsByOwner/:ownerId", getAppointmentsByOwner);
router.get(
  "/get-NonAvailableAppointmentsForDay/:date",
  getNonAvailableAppointmentsForDay
);
router.delete("/delete-appointment", deleteAppointment);
module.exports = router;
