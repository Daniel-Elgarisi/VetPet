const pool = require("../config/db");
const moment = require("moment-timezone");

const getPetInfo = async (petId) => {
  const result = await pool.query(
    `SELECT id, name, sex, pet_type, breed, dateofbirth FROM pets_profile WHERE id = $1`,
    [petId]
  );

  if (result.rows.length === 0) {
    throw new Error("חיית המחמד לא נמצאה");
  }

  const pet = result.rows[0];
  const age = moment().diff(moment(pet.dateofbirth), "years", true).toFixed(1);
  pet.dateofbirth = moment(pet.dateofbirth).format("DD-MM-YYYY");

  return { ...pet, age };
};

const getReferences = async (petId) => {
  const result = await pool.query(
    `SELECT r.*, a.date AS appointment_date, d.name AS doctor_name, d.license AS doctor_license
    FROM "references" r
    LEFT JOIN appointments a ON r.appointment = a.id
    LEFT JOIN doctor_profile d ON r.doctor_id = d.id
    WHERE r.pet_id = $1`,
    [petId]
  );

  if (result.rows.length === 0) {
    throw new Error("לא נמצאו הפניות עבור חיית המחמד הנתונה");
  }

  return result.rows;
};

const formatReferencesDates = (references) => {
  return references.map((row) => {
    const formattedRow = {
      ...row,
      date_issued: moment(row.appointment_date).format("DD-MM-YYYY"),
      created_at: moment(row.appointment_date).format("DD-MM-YYYY"),
    };

    /* istanbul ignore next */
    if (row.expiration_date) {
      formattedRow.expiration_date = moment(row.expiration_date).format(
        "DD-MM-YYYY"
      );
    }

    // Removing unnecessary fields
    delete formattedRow.appointment_date;
    delete formattedRow.pet_id;
    delete formattedRow.doctor_id;
    delete formattedRow.appointment;
    return formattedRow;
  });
};

const getReferencesDetail = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (!petId || isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    const petInfo = await getPetInfo(petId);
    const references = await getReferences(petId);
    const formattedReferences = formatReferencesDates(references);

    return res
      .status(200)
      .json({ pet: petInfo, references: formattedReferences });
  } catch (error) {
    console.error(error.message);
    /* istanbul ignore next */
    const statusCode =
      error.message === "חיית המחמד לא נמצאה" ||
      error.message === "לא נמצאו הפניות עבור חיית המחמד הנתונה"
        ? 404
        : 500;
    return res
      .status(statusCode)
      .send({ message: `שגיאה בהחזרת הפניות לחיית המחמד: ${error.message}` });
  }
};

module.exports = { getReferencesDetail };
