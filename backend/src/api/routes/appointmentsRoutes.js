const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentsForSinglePet,
  getNonAvailableAppointmentsForDay,
  deleteAppointment,
  getAppointmentTypes,
  getPreviousAppointmentsForOwner,
  getFutureAppointmentsForOwner,
  getPreviousAppointmentsForPet,
  getFutureAppointmentsForPet,
} = require("../../controllers/appointmentsController");

router.post("/create-appointment", createAppointment);
router.get("/get-appointments/:id", getAppointmentsForSinglePet);
router.get(
  "/get-NonAvailableAppointmentsForDay/:date",
  getNonAvailableAppointmentsForDay
);
router.delete("/delete-appointment", deleteAppointment);
router.get("/get-AppointmentTypes", getAppointmentTypes);
router.get(
  "/get-previousAppointmentsForOwner/:id",
  getPreviousAppointmentsForOwner
);
router.get(
  "/get-futureAppointmentsForOwner/:id",
  getFutureAppointmentsForOwner
);
router.get("/get-previousAppointments/:pet_id", getPreviousAppointmentsForPet);
router.get("/get-futureAppointments/:pet_id", getFutureAppointmentsForPet);

module.exports = router;
