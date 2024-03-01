const pool = require("../config/db");
const moment = require("moment-timezone");

const createAppointment = async (req, res) => {
  const { appointmentType, date, time, petId } = req.body;

  if (!appointmentType || !date || !time || !petId) {
    return res.status(400).json({
      message:
        "חסר מידע נדרש. אנא ספק את סוג הפגישה, תאריך, שעה ומזהה חיית מחמד.",
    });
  }

  const dateTimeForDb = `${date} ${time}`;

  try {
    const existingAppointmentResult = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE pet_id = $1 AND date = $2",
      [petId, dateTimeForDb]
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

  const doctorId = await getDoctorWithFewestAppointments(dateTimeForDb);
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
    const values = [appointmentType, dateTimeForDb, petId, doctorId];
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
      const formattedTimeSlots = timeSlotResult.rows.map((row) => {
        const timeSlot = row.time_slot;
        const [hours, minutes] = timeSlot.split(":");
        return `${hours}:${minutes}`; // Reconstructs the time without seconds
      });
      console.log("formattedTimeSlots: ", formattedTimeSlots[0]);
      res.json({
        message: "הפגישות האלה בתפוסה מלאה.",
        fullyBookedTimeSlots: formattedTimeSlots[0],
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

const deleteAppointment = async (req, res) => {
  const { date, time, petId } = req.query;

  console.log("date:", date, "time:", time, "petId:", petId);

  if (!date || !time || !petId) {
    return res.status(400).json({
      message: "חסר מידע נדרש. אנא ספק תאריך, שעה ומזהה חיית מחמד.",
    });
  }

  const formattedDateTime = formatAppointmentDateTime(date, time);
  const dateTime = `${formattedDateTime.date} ${formattedDateTime.time}:00`;
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
      return res.status(404).json({ message: "לא נמצאו סוגי פגישות." });
    }
    res.json(result.rows);
  } catch (error) {
    console.error("שגיאה בייבוא סוגי פגישות:", error);
    res.status(500).json({ message: "שגיאה בייבוא סוגי פגישות" });
  }
};

const getPreviousAppointmentsForPet = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);
  const now = moment().tz("Asia/Jerusalem").format();

  try {
    const result = await pool.query(
      "SELECT * FROM appointments WHERE pet_id = $1 AND date < $2",
      [petId, now]
    );
    if (result.rows.length > 0) {
      const formattedAppointments = result.rows.map((appointment) => {
        const formattedDateTime = formatAppointmentDateTime1(
          appointment.date.toISOString()
        );
        return {
          date: formattedDateTime.date,
          time: formattedDateTime.time,
          appointment_type: appointment.appointment_type,
        };
      });
      res.status(200).json(formattedAppointments);
    } else {
      res.status(404).json({ message: "לא נמצאו פגישות קודמות." });
    }
  } catch (error) {
    console.error("שגיאה בייבוא פגישות קודמות:", error);
    res.status(500).json({ message: "שגיאה בייבוא פגישות קודמות" });
  }
};

const getFutureAppointmentsForPet = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);
  const now = moment().tz("Asia/Jerusalem").format();

  try {
    const result = await pool.query(
      "SELECT * FROM appointments WHERE pet_id = $1 AND date >= $2",
      [petId, now]
    );
    if (result.rows.length > 0) {
      const formattedAppointments = result.rows.map((appointment) => {
        const formattedDateTime = formatAppointmentDateTime1(
          appointment.date.toISOString()
        );
        return {
          date: formattedDateTime.date,
          time: formattedDateTime.time,
          appointment_type: appointment.appointment_type,
        };
      });
      res.status(200).json(formattedAppointments);
    } else {
      res.status(404).json({ message: "לא נמצאו פגישות עתידיות." });
    }
  } catch (error) {
    console.error("שגיאה בייבוא פגישות עתידיות:", error);
    res.status(500).json({ message: "שגיאה בייבוא פגישות עתידיות" });
  }
};

const getPreviousAppointmentsForOwner = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);
  const now = moment().tz("Asia/Jerusalem");

  try {
    const result = await pool.query(
      `SELECT ap.*, pp.name AS pet_name
       FROM appointments ap
       JOIN pets_profile pp ON ap.pet_id = pp.id
       WHERE pp.owner_id = $1 AND ap.date < $2`,
      [ownerId, now]
    );
    if (result.rows.length > 0) {
      const formattedAppointments = result.rows.map((appointment) => {
        const formattedDateTime = formatAppointmentDateTime1(
          appointment.date.toISOString()
        );
        return {
          pet_name: appointment.pet_name,
          date: formattedDateTime.date,
          time: formattedDateTime.time,
          appointment_type: appointment.appointment_type,
        };
      });
      res.status(200).json(formattedAppointments);
    } else {
      res.status(404).json({ message: "לא נמצאו פגישות קודמות." });
    }
  } catch (error) {
    console.error("שגיאה בייבוא פגישות קודמות:", error);
    res.status(500).json({ message: "שגיאה בייבוא פגישות קודמות" });
  }
};

const getFutureAppointmentsForOwner = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);
  const now = moment().tz("Asia/Jerusalem");

  try {
    const result = await pool.query(
      `SELECT ap.*, pp.name AS pet_name
       FROM appointments ap
       JOIN pets_profile pp ON ap.pet_id = pp.id
       WHERE pp.owner_id = $1 AND ap.date >= $2`,
      [ownerId, now.toISOString()]
    );
    if (result.rows.length > 0) {
      const formattedAppointments = result.rows.map((appointment) => {
        const formattedDateTime = formatAppointmentDateTime1(
          appointment.date.toISOString()
        );
        return {
          pet_name: appointment.pet_name,
          date: formattedDateTime.date,
          time: formattedDateTime.time,
          appointment_type: appointment.appointment_type,
        };
      });
      res.status(200).json(formattedAppointments);
    } else {
      res.status(404).json({ message: "לא נמצאו פגישות עתידיות." });
    }
  } catch (error) {
    console.error("שגיאה בייבוא פגישות עתידיות:", error);
    res.status(500).json({ message: "שגיאה בייבוא פגישות עתידיות" });
  }
};

const updateAppointment = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);
  const { date, time, appointmentType } = req.body;

  if (!date && !time && !appointmentType) {
    return res
      .status(400)
      .json({ message: "חסר מידע נדרש. אנא ספק תאריך, שעה או סוג פגישה." });
  }
  if (isNaN(petId)) {
    return res
      .status(400)
      .json({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    const result = await pool.query(
      "SELECT date, appointment_type FROM appointments WHERE pet_id = $1",
      [petId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "לא נמצא תור קיים." });
    }
    const currentAppointment = result.rows[0];

    // Trim the appointment types for comparison
    const currentTypeTrimmed = currentAppointment.appointment_type.trim();
    const inputTypeTrimmed = appointmentType.trim();

    // Check if there are changes to update
    const isTypeChanged = currentTypeTrimmed !== inputTypeTrimmed;
    const inputDateTime =
      date && time
        ? moment
            .tz(`${date} ${time}`, "DD-MM-YYYY HH:mm", "Asia/Jerusalem")
            .toISOString()
        : null;
    const isDateChanged =
      inputDateTime && inputDateTime !== currentAppointment.date.toISOString();

    if (!isDateChanged && !isTypeChanged) {
      return res.status(200).json({ message: "אין שינויים לעדכון." });
    }

    // Construct the update query
    const updates = [];
    const values = [];
    if (isDateChanged) {
      updates.push(`date = $${updates.length + 1}`);
      values.push(inputDateTime);
    }
    if (isTypeChanged) {
      updates.push(`appointment_type = $${updates.length + 1}`);
      values.push(inputTypeTrimmed);
    }
    values.push(petId);

    const updateQuery = `UPDATE appointments SET ${updates.join(
      ", "
    )} WHERE pet_id = $${values.length} RETURNING *;`;

    const updateResult = await pool.query(updateQuery, values);
    return res.status(200).json({
      message: "התור עודכן בהצלחה.",
      appointment: updateResult.rows[0],
    });
  } catch (error) {
    console.error("שגיאה בעדכון תור קיים: ", error);
    return res.status(500).json({ message: "שגיאה בעדכון תור קיים." });
  }
};

// Helper functions
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

function formatDateToISO(dateTimeStr) {
  try {
    const [day, month, year] = dateTimeStr.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    const isoDate = date.toISOString().split("T")[0];

    return isoDate;
  } catch (error) {
    console.error("Error formatting date to ISO:", error);
    throw new Error("פורמט תאריך/שעה לא חוקי");
  }
}

function formatAppointmentDateTime(date, time) {
  const formattedDate = date;
  const [hours, minutes] = time.split(":");
  const formattedTime = `${hours}:${minutes}`;

  return { date: formattedDate, time: formattedTime };
}

function formatAppointmentDateTime1(isoString) {
  const momentDateTime = moment.tz(isoString, "UTC").tz("Asia/Jerusalem");
  return {
    date: momentDateTime.format("DD-MM-YYYY"), // format date as "DD-MM-YYYY"
    time: momentDateTime.format("HH:mm"), // format time as "HH:MM"
  };
}

module.exports = {
  createAppointment,
  getAppointmentsForSinglePet,
  getNonAvailableAppointmentsForDay,
  deleteAppointment,
  getAppointmentTypes,
  getPreviousAppointmentsForOwner,
  getFutureAppointmentsForOwner,
  getPreviousAppointmentsForPet,
  getFutureAppointmentsForPet,
  updateAppointment,
};
