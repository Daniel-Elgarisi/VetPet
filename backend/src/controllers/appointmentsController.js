const pool = require("../config/db");

function formatAppointmentDateTime(date, time) {
  const [day, month, year] = date.split("-");
  const formattedDateTime = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )} ${time}`;
  // Assuming the server and DB are set to handle time zones correctly, you might not need to add the "+03"
  return formattedDateTime;
}

const createAppointment = async (req, res) => {
  const { appointmentType, date, time, petId } = req.body;

  if (!appointmentType || !date || !time || !petId) {
    return res.status(400).json({
      message:
        "חסר מידע נדרש. אנא ספק את סוג הפגישה, תאריך, שעה ומזהה חיית מחמד.",
    });
  }

  const dateTime = formatAppointmentDateTime(date, time);

  try {
    const existingAppointmentResult = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE pet_id = $1 AND date = $2",
      [petId, dateTime]
    );

    if (parseInt(existingAppointmentResult.rows[0].count, 10) > 0) {
      return res.status(400).json({
        message: "לחיית המחמד הזו כבר יש תור במועד שצוין.",
      });
    }
  } catch (error) {
    console.error("שגיאה בבדיקת פגישות קיימות:", error);
    return res.status(500).json({ message: "שגיאה בבדיקת פגישות קיימות" });
  }

  const doctorId = await getDoctorWithFewestAppointments(dateTime);
  if (!doctorId) {
    return res
      .status(400)
      .json({ message: "אין רופאים זמינים לתאריך ולשעה אלו." });
  }

  try {
    const insertQuery = `
      INSERT INTO appointments (appointment_type, date, pet_id, doctor_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [appointmentType, dateTime, petId, doctorId];
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("שגיאה ביצירת פגישה:", error);
    res.status(500).json({ message: "שגיאה ביצירת פגישה" });
  }
};

const getAppointmentsForSinglePet = async (req, res) => {
  try {
    const petId = parseInt(req.params.id, 10);
    const result = await pool.query(
      "SELECT id, appointment_type, date, pet_id, doctor_id FROM appointments WHERE pet_id = $1",
      [petId]
    );

    const appointments = result.rows.map((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const displayDate = appointmentDate.toLocaleString("en-GB", {
        timeZone: "Asia/Jerusalem",
      });
      const [date, time] = displayDate.split(", ");
      const [day, month, year] = date.split("/");
      const formattedDate = `${day}-${month}-${year}`;

      return {
        ...appointment,
        date: formattedDate,
        time,
      };
    });
    console.log(appointments);

    res.json(appointments);
  } catch (error) {
    console.error("שגיאה בייבוא פגישות:", error);
    res.status(500).json({ message: "שגיאה בייבוא פגישות:" });
  }
};

const getNonAvailableAppointmentsForDay = async (req, res) => {
  const formattedDate = formatDateToISO(req.params.date);
  console.log("formattedDate: ", formattedDate);
  try {
    const doctorCountResult = await pool.query(
      "SELECT COUNT(*) AS total_doctors FROM doctor_profile"
    );

    const totalDoctors = parseInt(doctorCountResult.rows[0].total_doctors, 10);
    console.log("total doctors: ", totalDoctors);
    const timeSlotResult = await pool.query(
      `
        SELECT date::time as time_slot, COUNT(*) as appointment_count
        FROM appointments
        WHERE date::date = $1
        GROUP BY date::time
        HAVING COUNT(*) >= $2
      `,
      [formattedDate, totalDoctors]
    );

    if (timeSlotResult.rowCount > 0) {
      res.json({
        message: "הפגישות האלה בתפוסה מלאה.",
        fullyBookedTimeSlots: timeSlotResult.rows,
      });
    } else {
      res.json({ message: "אין פגישות בתפוסה מלאה ליום זה." });
    }
  } catch (error) {
    console.error("שגיאה בהחזרת תורים תפוסים: ", error);
    res.status(500).json({ message: "שגיאה בהחזרת תורים תפוסים" });
  }
};

const getAppointmentsByOwner = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);

  try {
    const petsResult = await pool.query(
      "SELECT id FROM pets_profile WHERE owner_id = $1",
      [ownerId]
    );
    const petIds = petsResult.rows.map((row) => row.id);

    const appointmentsResult = await pool.query(
      "SELECT * FROM appointments WHERE pet_id = ANY($1::int[])",
      [petIds]
    );

    const appointments = appointmentsResult.rows.map((appointment) => ({
      ...appointment,
      date: appointment.date.toISOString(),
    }));

    res.json(appointments);
  } catch (error) {
    console.error("שגיאה בהחזרת תורים לבעל חיית המחמד: ", error);
    res.status(500).json({ message: "שגיאה בהחזרת תורים לבעל חיית המחמד" });
  }
};

function formatDateToISO(dateTimeStr) {
  try {
    const date = new Date(dateTimeStr);
    return date.toISOString();
  } catch (error) {
    console.error("Error formatting date to ISO:", error);
    throw new Error("פורמט תאריך/שעה לא חוקי");
  }
}

const getDoctorWithFewestAppointments = async (dateTime) => {
  const date = dateTime.split(" ")[0];
  const time = dateTime.split(" ")[1];

  const query = `
    SELECT d.id AS doctor_id
    FROM doctor_profile d
    WHERE NOT EXISTS (
      SELECT 1
      FROM appointments a
      WHERE a.doctor_id = d.id
      AND a.date::date = $1::date
      AND a.date::time = $2::time
    )
    ORDER BY (
      SELECT COUNT(*)
      FROM appointments a2
      WHERE a2.doctor_id = d.id
      AND a2.date::date = $1::date
    ) ASC
    LIMIT 1;
  `;
  const values = [date, time];
  const res = await pool.query(query, values);
  return res.rows[0]?.doctor_id;
};

const deleteAppointment = async (req, res) => {
  const { date, time, petId } = req.body;

  console.log("date:", date, "time:", time, "petId:", petId);

  if (!date || !time || !petId) {
    return res.status(400).json({
      message: "חסר מידע נדרש. אנא ספק תאריך, שעה ומזהה חיית מחמד.",
    });
  }

  const dateTime = formatAppointmentDateTime(date, time);
  console.log("datetime:", dateTime);
  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE date = $1 AND pet_id = $2 RETURNING *",
      [dateTime, petId]
    );
    if (result.rowCount > 0) {
      res.json({ message: "הפגישה נמחקה בהצלחה." });
    } else {
      res.status(404).json({ message: "פגישה לא נמצאה." });
    }
  } catch (error) {
    console.error("שגיאה במחיקת פגישה:", error);
    res.status(500).json({ message: "שגיאה במחיקת פגישה" });
  }
};

const getAppointmentTypes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments_types");
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No appointment types found." });
    }
    res.json(result.rows);
  } catch (error) {
    console.error("שגיאה בייבוא סוגי פגישות:", error);
    res.status(500).json({ message: "שגיאה בייבוא סוגי פגישות" });
  }
};

module.exports = {
  createAppointment,
  getAppointmentsForSinglePet,
  getAppointmentsByOwner,
  getNonAvailableAppointmentsForDay,
  deleteAppointment,
  getAppointmentTypes,
};
