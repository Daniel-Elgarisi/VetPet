const pool = require("../config/db");
const moment = require("moment-timezone");

const getRecords = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (!petId) {
    return res.status(400).send({ message: "חסר מידע אודות חיית המחמד." });
  }

  /* istanbul ignore next */
  if (isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    // Get pet details
    const petResult = await pool.query(
      `SELECT name, chip_number, breed, weight, sex, pet_type, dateofbirth FROM pets_profile WHERE id = $1`,
      [petId]
    );

    if (petResult.rows.length === 0) {
      return res.status(404).send({ message: "חיית המחמד לא נמצאה." });
    }

    const pet = petResult.rows[0];
    const petInfo = {
      name: pet.name,
      chip_number: pet.chip_number,
      breed: pet.breed,
      weight: pet.weight.toString(),
      sex: pet.sex,
      pet_type: pet.pet_type,
      age: moment().diff(moment(pet.dateofbirth), "years", true).toFixed(1),
      dateofbirth: moment(pet.dateofbirth).format("DD-MM-YYYY"),
    };

    // Records details
    const recordsResult = await pool.query(
      `SELECT r.*, r.references AS reference_id, a.date AS appointment_date, a.appointment_type, d.name AS doctor_name, d.license AS doctor_license
       FROM records r
       LEFT JOIN appointments a ON r.appointment = a.id
       LEFT JOIN doctor_profile d ON r.doctor_id = d.id
       WHERE r.pet_id = $1
       ORDER BY r.date ASC`,
      [petId]
    );

    // Get prescriptions and references for each record
    const records = await Promise.all(
      recordsResult.rows.map(async (record) => {
        const prescriptionsResult = await pool.query(
          `SELECT p.*, d.name AS doctor_name, d.license AS doctor_license
           FROM pets_prescription p
           LEFT JOIN doctor_profile d ON p.doctor_id = d.id
           WHERE p.records_id = $1`,
          [record.id]
        );

        const prescriptions = prescriptionsResult.rows.map((prescription) => ({
          id: prescription.id,
          medicine: prescription.medicine,
          instructions: prescription.instructions,
          treatment_duration: prescription.treatment_duration,
          administrative_information: prescription.administrative_information,
          dose: prescription.dose,
          times: {
            morning: prescription.morning,
            noon: prescription.noon,
            evening: prescription.evening,
          },
          purchase: {
            from: moment(prescription.purchase_from).format("DD-MM-YYYY"),
            until: moment(prescription.purchase_until).format("DD-MM-YYYY"),
            status: prescription.purchase_status,
          },
          doctor: {
            id: prescription.doctor_id,
            name: prescription.doctor_name,
            license: prescription.doctor_license,
          },
        }));

        // Get references
        let references = [];
        if (record.reference_id) {
          const referencesResult = await pool.query(
            `SELECT r.*, d.name AS doctor_name, d.license AS doctor_license
             FROM "references" r
             LEFT JOIN doctor_profile d ON r.doctor_id = d.id
             WHERE r.id = $1`,
            [record.reference_id]
          );

          references = referencesResult.rows.map((reference) => ({
            id: reference.id,
            date_issued: moment(reference.date_issued).format("DD-MM-YYYY"),
            reference_type: reference.reference_type,
            description: reference.description,
            expiration_date: reference.expiration_date
              ? moment(reference.expiration_date).format("DD-MM-YYYY")
              : null /* istanbul ignore next */,
            notes: reference.notes,
            created_at: moment(reference.created_at).format("DD-MM-YYYY"),
            doctor: {
              id: reference.doctor_id,
              name: reference.doctor_name,
              license: reference.doctor_license,
            },
          }));
        }

        return {
          id: record.id,
          date: moment(record.date).format("DD-MM-YYYY"),
          diagnosis: record.diagnosis,
          symptoms: record.symptoms,
          description: record.description,
          examination: record.physical_examination,
          imaging: record.imaging_results,
          treatmentPlan: record.treatment_plan,
          causeOfReferral: record.cause_of_referral,
          appointment: {
            id: record.appointment,
            type: record.appointment_type,
            doctor: {
              id: record.doctor_id,
              name: record.doctor_name,
              license: record.doctor_license,
            },
          },
          prescriptions,
          references,
        };
      })
    );

    return res.status(200).json({
      pet: petInfo,
      records,
    });
  } catch (error) {
    /* istanbul ignore next */
    console.error(error);
    /* istanbul ignore next */
    res.status(500).send("שגיאה בהבאת רשומות חיית המחמד");
  }
};

module.exports = { getRecords };
