const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentsForSinglePet,
  getAppointmentsByOwner,
  getNonAvailableAppointmentsForDay,
  deleteAppointment,
  getAppointmentTypes,
} = require("../../controllers/appointmentsController");

router.post("/create-appointment", createAppointment);
router.get("/get-appointments/:id", getAppointmentsForSinglePet);
router.get("/get-appointmentsByOwner/:id", getAppointmentsByOwner);
router.get(
  "/get-NonAvailableAppointmentsForDay/:date",
  getNonAvailableAppointmentsForDay
);
router.delete("/delete-appointment", deleteAppointment);
router.get("/get-AppointmentTypes", getAppointmentTypes);
module.exports = router;
