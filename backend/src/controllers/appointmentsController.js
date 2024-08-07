const pool = require("../config/db");
const moment = require("moment-timezone");

/* istanbul ignore next */
const {
  createDailyRoom,
  getParticipantCountBySessionId,
} = require("../utils/dailyService");

/* istanbul ignore next */
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

  let roomUrl = null;
  if (appointmentType === "שיחת וידיאו") {
    try {
      const dailyRoom = await createDailyRoom();
      roomUrl = dailyRoom.url;
    } catch (error) {
      console.error("שגיאה ביצירת חדר וידאו:", error);
      return res.status(500).json({ message: "שגיאה ביצירת חדר וידאו" });
    }
  }
  try {
    const insertQuery = `
      INSERT INTO appointments (appointment_type, date, pet_id, doctor_id, room_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [appointmentType, dateTimeForDb, petId, doctorId, roomUrl];
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("שגיאה ביצירת פגישה:", error);
    res.status(500).json({ message: "שגיאה ביצירת פגישה" });
  }
};

/* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה בייבוא פגישות:", error);
    /* istanbul ignore next */
    res.status(500).json({ message: "שגיאה בייבוא פגישות:" });
  }
};

const getNonAvailableAppointmentsForDay = async (req, res) => {
  const formattedDate = formatDateToISO(req.params.date);
  try {
    const doctorCountResult = await pool.query(
      "SELECT COUNT(*) AS total_doctors FROM doctor_profile"
    );

    const totalDoctors = parseInt(doctorCountResult.rows[0].total_doctors, 10);
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

    /* istanbul ignore next */
    if (timeSlotResult.rowCount > 0) {
      const formattedTimeSlots = timeSlotResult.rows.map((row) => {
        const timeSlot = row.time_slot;
        const [hours, minutes] = timeSlot.split(":");
        return `${hours}:${minutes}`;
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
    /* istanbul ignore next */
    console.error("שגיאה בהחזרת תורים תפוסים: ", error);
    /* istanbul ignore next */
    res.status(500).json({ message: "שגיאה בהחזרת תורים תפוסים" });
  }
};

/* istanbul ignore next */
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

/* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה במחיקת פגישה:", error);
    /* istanbul ignore next */
    res.status(500).json({ message: "שגיאה במחיקת פגישה" });
  }
};

const getAppointmentTypes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments_types");
    /* istanbul ignore next */
    if (result.rows.length === 0) {
      /* istanbul ignore next */
      return res
        .status(404)
        .json({ message: "לא נמצאו סוגי פגישות." }); /* istanbul ignore next */
    }
    res.json(result.rows);
  } catch (error) {
    /* istanbul ignore next */
    console.error("שגיאה בייבוא סוגי פגישות:", error);
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה בייבוא פגישות קודמות:", error);
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה בייבוא פגישות עתידיות:", error);
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה בייבוא פגישות קודמות:", error);
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה בייבוא פגישות עתידיות:", error);
    /* istanbul ignore next */
    res.status(500).json({ message: "שגיאה בייבוא פגישות עתידיות" });
  }
};

/* istanbul ignore next */
const updateAppointment = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);
  const {
    previousDate,
    previousTime,
    previousAppointmentType,
    date,
    time,
    appointmentType,
  } = req.body;

  console.log(petId);

  if (
    !previousDate ||
    !previousTime ||
    !previousAppointmentType ||
    !date ||
    !time ||
    !appointmentType
  ) {
    return res.status(400).json({ message: "חסר מידע נדרש לעדכון." });
  }

  if (isNaN(petId)) {
    return res
      .status(400)
      .json({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    const isDateExist = `${date} ${time}`;

    const existingAppointmentResult = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE pet_id = $1 AND date = $2",
      [petId, isDateExist]
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

  try {
    const previousDateTimeISO = moment
      .tz(
        `${previousDate} ${previousTime}`,
        "DD-MM-YYYY HH:mm",
        "Asia/Jerusalem"
      )
      .toISOString();

    // Find the specific appointment to update
    const findAppointmentQuery = `
      SELECT id, room_url FROM appointments
      WHERE pet_id = $1 AND date = $2 AND appointment_type = $3
    `;
    const findAppointmentResult = await pool.query(findAppointmentQuery, [
      petId,
      previousDateTimeISO,
      previousAppointmentType,
    ]);

    if (findAppointmentResult.rows.length === 0) {
      return res.status(404).json({ message: "לא נמצא תור קיים לעדכון." });
    }

    const appointmentIdToUpdate = findAppointmentResult.rows[0].id;
    const currentRoomUrl = findAppointmentResult.rows[0].room_url;

    // Prepare new date and time
    const newDateTimeISO = moment
      .tz(`${date} ${time}`, "DD-MM-YYYY HH:mm", "Asia/Jerusalem")
      .toISOString();

    let newRoomUrl = currentRoomUrl;

    // Case 1: Updating from video call type to another type
    if (
      previousAppointmentType === "שיחת וידיאו" &&
      appointmentType !== "שיחת וידיאו"
    ) {
      newRoomUrl = null;
    }

    // Case 2: Updating from another type to video call type
    if (appointmentType === "שיחת וידיאו") {
      try {
        const dailyRoom = await createDailyRoom();
        newRoomUrl = dailyRoom.url;
      } catch (error) {
        console.error("שגיאה ביצירת חדר וידאו:", error);
        return res.status(500).json({ message: "שגיאה ביצירת חדר וידאו" });
      }
    }

    // Update the appointment
    const updateQuery = `
      UPDATE appointments
      SET date = $1, appointment_type = $2, room_url = $3
      WHERE id = $4
      RETURNING *;
    `;
    const updateResult = await pool.query(updateQuery, [
      newDateTimeISO,
      appointmentType,
      newRoomUrl,
      appointmentIdToUpdate,
    ]);

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
/* istanbul ignore next */
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

/* istanbul ignore next */
const getFutureAppointmentsForOwnerInNext3Days = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);
  const now = moment().tz("Asia/Jerusalem");
  const threeDaysLater = now.clone().add(3, "days").endOf("day");

  try {
    const result = await pool.query(
      `SELECT ap.*, pp.name AS pet_name
           FROM appointments ap
           JOIN pets_profile pp ON ap.pet_id = pp.id
           WHERE pp.owner_id = $1 AND ap.date >= $2 AND ap.date <= $3`,
      [ownerId, now.toISOString(), threeDaysLater.toISOString()]
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
      res
        .status(404)
        .json({ message: "No future meetings found in the next 3 days." });
    }
  } catch (error) {
    console.error(
      "Error importing future appointments in the next 3 days:",
      error
    );
    res
      .status(500)
      .json({ message: "Error importing future meetings in the next 3 days" });
  }
};

/* istanbul ignore next */
const getVideoCallAppointmentForDoctor = async (req, res) => {
  const vetId = parseInt(req.params.doctor_id, 10);

  if (!vetId) {
    return res.status(400).send({ message: "חסר מידע אודות הוטרינר." });
  }

  if (isNaN(vetId)) {
    return res
      .status(400)
      .send({ message: "המזהה של הוטרינר חייב להיות מספר." });
  }

  try {
    const currentDate = moment().format("DD-MM-YYYY");

    const videoCallAppointment = await pool.query(
      `SELECT * FROM appointments WHERE appointment_type = 'שיחת וידיאו' AND doctor_id = $1 AND date::date = $2::date`,
      [vetId, currentDate]
    );

    if (videoCallAppointment.rows.length === 0) {
      return res.status(404).send({ message: "לא נמצאו תורים לשיחת וידאו." });
    }

    const appointmentsWithFormattedDateAndTime = videoCallAppointment.rows.map(
      (row) => {
        return {
          ...row,
          date: moment(row.date).format("DD-MM-YYYY"),
          time: moment(row.date).format("HH:mm"),
        };
      }
    );

    const petIds = [
      ...new Set(videoCallAppointment.rows.map((row) => row.pet_id)),
    ];

    const petDetailsPromises = petIds.map(async (petId) => {
      const petDetails = await pool.query(
        `SELECT pp.name AS pet_name, pp.breed, pp.weight, pp.pet_type, op.name AS owner_name 
         FROM pets_profile pp
         JOIN owners_profile op ON pp.owner_id = op.id
         WHERE pp.id = $1`,
        [petId]
      );
      return { petId, ...petDetails.rows[0] };
    });

    const petDetails = await Promise.all(petDetailsPromises);

    const response = appointmentsWithFormattedDateAndTime.map((appointment) => {
      const petDetail = petDetails.find(
        (pet) => pet.petId === appointment.pet_id
      );
      return {
        appointment: {
          id: appointment.id,
          date: appointment.date,
          pet_id: appointment.pet_id,
          appointment_type: appointment.appointment_type,
          time: appointment.time,
          room_url: appointment.room_url,
        },
        petDetails: petDetail,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("שגיאה בייבוא פגישת וידאו להוטרינר: ", error);
    return res.status(500).send("שגיאה בייבוא פגישת וידאו להוטרינר");
  }
};

/* istanbul ignore next */
const getVideoCallForPet = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (!petId) {
    return res.status(400).send({ message: "חסר מידע אודות חיית המחמד." });
  }

  if (isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    const currentDate = moment().format("YYYY-MM-DD");

    const videoCallAppointment = await pool.query(
      `SELECT a.*, d.name AS doctor_name 
       FROM appointments a
       JOIN doctor_profile d ON a.doctor_id = d.id
       WHERE a.appointment_type = 'שיחת וידיאו' AND a.pet_id = $1 AND a.date::date = $2::date`,
      [petId, currentDate]
    );

    if (videoCallAppointment.rows.length === 0) {
      return res.status(404).send("לא נמצאו תורים לשיחת וידאו.");
    }

    const appointmentsWithFormattedDateAndTime = videoCallAppointment.rows.map(
      (row) => {
        return {
          ...row,
          date: moment(row.date).format("DD-MM-YYYY"),
          time: moment(row.date).format("HH:mm"),
        };
      }
    );

    appointmentsWithFormattedDateAndTime.forEach((appointment) => {
      delete appointment.pet_id;
      delete appointment.doctor_id;
      delete appointment.appointment_type;
    });

    return res.status(200).json(appointmentsWithFormattedDateAndTime);
  } catch (error) {
    console.error("שגיאה בייבוא פגישת וידאו לחיית מחמד: ", error);
    return res.status(500).send("שגיאה בייבוא פגישת וידאו לחיית מחמד");
  }
};

/* istanbul ignore next */
const getParticipantCount = async (req, res) => {
  const { roomName } = req.query;

  if (!roomName) {
    return res.status(400).json({ message: "חסר שם חדר." });
  }

  if (typeof roomName !== "string") {
    return res.status(400).json({ message: "שם חדר חייב להיות מחרוזת." });
  }

  try {
    const participantCount = await getParticipantCountBySessionId(roomName);
    console.log("participantCount: ", participantCount);

    if (participantCount === 0) {
      return res.status(404).json({ message: "לא נמצאו משתתפים." });
    }

    res.status(200).json({ participantCount });
  } catch (error) {
    console.error("שגיאה בייבוא ספירת משתתפים:", error);
    return res.status(500).json({ message: "שגיאה בייבוא ספיר" });
  }
};

/* istanbul ignore next */
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

/* istanbul ignore next */
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
  getFutureAppointmentsForOwnerInNext3Days,
  getVideoCallAppointmentForDoctor,
  getVideoCallForPet,
  getParticipantCount,
};
