const pool = require("../config/db");
const moment = require("moment-timezone");

/* istanbul ignore next */
const getPetMedicalTestResults = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (isNaN(petId)) {
    return res
      .status(400)
      .json({ message: "המזהה של חיית המחמד חייב להיות מספר" });
  }

  try {
    const query = `
    SELECT id, test_type, date_executed
    FROM complete_blood_count_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM blood_chemistry_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM urinalysis_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM fecal_examination_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM thyroid_function_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM pancreatic_function_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM coagulation_profile_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM xray_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM ultrasound_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM mri_results
    WHERE pet_id = $1
    UNION ALL
    SELECT id, test_type, date_executed
    FROM ct_scan_results
    WHERE pet_id = $1
    `;

    const result = await pool.query(query, [petId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "לא נמצאו תוצאות בדיקות לחיית המחמד הנתונה" });
    }

    const formattedRows = result.rows.map((row) => {
      const formattedDate = formatDateTime(row.date_executed);
      return {
        ...row,
        date_executed: formattedDate.date,
      };
    });

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("שגיאה בהחזרת תוצאות בדיקות:", error);
    res
      .status(500)
      .json({ message: "אירעה שגיאה בהחזרת תוצאות הבדיקות של חיית המחמד" });
  }
};

/* istanbul ignore next */
const getTestResultDetails = async (req, res) => {
  const testId = parseInt(req.params.test_id, 10);
  const tableName = req.params.table_name;

  if (isNaN(testId)) {
    return res
      .status(400)
      .json({ message: "המזהה של תוצאת בדיקה חייב להיות מספר" });
  }

  if (typeof tableName !== "string") {
    return res.status(400).json({ message: "שם הטבלה חייב להיות מסוג מחרוזת" });
  }

  const allowedTables = [
    "complete_blood_count_results",
    "blood_chemistry_results",
    "urinalysis_results",
    "fecal_examination_results",
    "thyroid_function_results",
    "pancreatic_function_results",
    "coagulation_profile_results",
    "xray_results",
    "ultrasound_results",
    "mri_results",
    "ct_scan_results",
  ];
  if (!allowedTables.includes(tableName)) {
    return res
      .status(400)
      .json({ message: "לא קיימת טבלת תוצאות מסוג זה במערכת" });
  }

  try {
    const query = `
            SELECT *
            FROM ${tableName}
            WHERE id = $1
        `;

    const result = await pool.query(query, [testId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "לא נמצאה תוצאת הבדיקה הנתונה" });
    }

    const { id, pet_id, date_executed, test_type, ...filteredResult } =
      result.rows[0];
    res.status(200).json(filteredResult);
  } catch (error) {
    console.error("שגיאה בהחזרת תוצאת בדיקה:", error);
    res
      .status(500)
      .json({ message: "אירעה שגיאה בהחזרת תוצאת הבדיקה של חיית המחמד" });
  }
};

/* istanbul ignore next */
const getBloodTestFindingsInfo = async (req, res) => {
  const test_type = req.params.test_type;
  const pet_gender = req.params.pet_gender;
  const pet_type = req.params.pet_type;

  if (!test_type || !pet_gender || !pet_type) {
    return res
      .status(400)
      .json({ message: "חסרים פרמטרים למציאת מידע עבור ממצאי בדיקה" });
  }

  if (
    typeof test_type !== "string" ||
    typeof pet_gender !== "string" ||
    typeof pet_type !== "string"
  ) {
    return res.status(400).json({
      message: "הפרמטרים למציאת מידע עבור ממצאי בדיקה חייבים להיות מסוג מחרוזת",
    });
  }

  try {
    const query = `
            SELECT finding_name, min_range, max_range, units_of_measurement
            FROM test_findings
            WHERE test = $1 AND pet_type = $2 AND gender = $3
        `;
    const result = await pool.query(query, [test_type, pet_type, pet_gender]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "לא נמצא מידע עבור ממצאי בדיקה" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("שגיאה בהחזרת מידע עבור ממצאי בדיקה:", error);
    res
      .status(500)
      .json({ message: "אירעה שגיאה בהחזרת בהחזרת מידע עבור ממצאי בדיקה" });
  }
};

/* istanbul ignore next */
function formatDateTime(isoString) {
  const momentDateTime = moment.tz(isoString, "UTC").tz("Asia/Jerusalem");
  return {
    date: momentDateTime.format("DD-MM-YYYY"),
    time: momentDateTime.format("HH:mm"),
  };
}

module.exports = {
  getPetMedicalTestResults,
  getTestResultDetails,
  getBloodTestFindingsInfo,
};
