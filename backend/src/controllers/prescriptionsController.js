const pool = require("../config/db");
const moment = require("moment-timezone");

const getPetInfo = async (petId) => {
  const result = await pool.query(
    `SELECT id, name, sex, pet_type, dateofbirth FROM pets_profile WHERE id = $1`,
    [petId]
  );

  if (result.rows.length === 0) {
    throw new Error("Pet not found");
  }

  const pet = result.rows[0];
  const age = moment().diff(moment(pet.dateofbirth), "years", true).toFixed(1);

  return { ...pet, age };
};

const getPrescriptions = async (petId) => {
  const result = await pool.query(
    `SELECT pe.name, pe.sex, pe.pet_type, pe.dateofbirth, pe.breed, p.id AS prescription_id, p.date, p.medicine, p.dose, p.instructions, p.treatment_duration, p.morning, p.noon, p.evening, p.purchase_from, p.purchase_until, p.administrative_information, p.purchase_status,
            a.date AS appointment_date, a.appointment_type, 
            d.name AS doctor_name, d.license
     FROM pets_prescription p
     JOIN appointments a ON p.appointment = a.id
     JOIN doctor_profile d ON a.doctor_id = d.id
     JOIN pets_profile pe ON p.pet_id = pe.id
     WHERE p.pet_id = $1`,
    [petId]
  );

  result.rows.forEach((row) => {
    row.dateofbirth = moment(row.dateofbirth).format("DD-MM-YYYY");
    row.date = moment(row.date).format("DD-MM-YYYY");
  });

  /* istanbul ignore next */
  if (result.rows.length === 0) {
    throw new Error("No prescriptions found for the given pet");
  }

  return result.rows;
};

const formatPrescriptionDates = (prescriptions, age) => {
  return prescriptions.map((row) => ({
    ...row,
    purchase_from: moment(row.purchase_from).format("DD-MM-YYYY"),
    purchase_until: moment(row.purchase_until).format("DD-MM-YYYY"),
    appointment_date: moment(row.appointment_date).format("DD-MM-YYYY"),
    age,
  }));
};

const getPrescriptionsDetail = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (!petId || isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    const petInfo = await getPetInfo(petId);
    const prescriptions = await getPrescriptions(petId);
    const formattedPrescriptions = formatPrescriptionDates(
      prescriptions,
      petInfo.age
    );

    return res.status(200).json(formattedPrescriptions);
  } catch (error) {
    console.error(error.message);
    /* istanbul ignore next */
    const statusCode =
      error.message === "Pet not found" ||
      error.message === "No prescriptions found for the given pet"
        ? 404
        : 500;
    return res
      .status(statusCode)
      .send({ message: `שגיאה בהחזרת מרשמים לחיית המחמד: ${error.message}` });
  }
};

module.exports = { getPrescriptionsDetail };
