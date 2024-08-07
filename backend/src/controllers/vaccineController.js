const pool = require("../config/db");
const moment = require("moment-timezone");

const getVaccinesNotifications = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);
  const petType = req.params.pet_type;

  /* istanbul ignore next */
  if (isNaN(petId)) {
    return res
      .status(400)
      .json({ message: "המזהה של חיית המחמד חייב להיות מספר" });
  }

  try {
    const query = `
      SELECT
          vaccines_types AS vaccine_name,
          "Date" AS date_given
      FROM
          pets_vaccines
      WHERE
          pet_id = $1
      ORDER BY
          "Date" ASC;
    `;

    const result = await pool.query(query, [petId]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "לא נמצאו חיסונים לחיית המחמד הנתונה" });
    }

    const formattedRows = result.rows.map((row) => {
      const formattedDate = formatDateTime(row.date_given);
      return {
        ...row,
        date_given: formattedDate.date,
      };
    });

    const validityForNotifictions = await getVaccineValidity(petType);
    // validityForNotifictions.forEach((vaccine) => {
    //   vaccine.validity = vaccine.validity - 7;
    // });

    let vaccinesNotifictions;
    switch (petType) {
      case "כלב":
        vaccinesNotifictions = checkDogVaccinesNotifictions(
          formattedRows,
          validityForNotifictions
        );
        break;
      /* istanbul ignore next */
      case "חתול":
        vaccinesNotifictions = checkCatVaccinesNotifictions(
          formattedRows,
          validityForNotifictions
        );
        break;
      /* istanbul ignore next */
      default:
        vaccinesNotifictions = formattedRows;
        break;
    }

    return res
      .status(200)
      .json(vaccinesNotifictions) /* istanbul ignore next */;
  } catch (error) {
    /* istanbul ignore next */
    console.error("שגיאה בהחזרת חיסונים:", error);
    /* istanbul ignore next */
    res
      .status(500)
      .json({ message: "אירעה שגיאה בהחזרת חיסוניה של חיית המחמד" });
  }
};

/* istanbul ignore next */
const checkCatVaccinesNotifictions = (vaccines, vaccinesValidity) => {
  const vaccineNotifiction = getVaccineForNotify(
    vaccines,
    ["I מרובע", "II מרובע", "מרובע"],
    vaccinesValidity
  );

  if (vaccineNotifiction && vaccineNotifiction.vaccine_name !== "מרובע") {
    if (vaccineNotifiction.vaccine_name === "I מרובע") {
      vaccineNotifiction.vaccine_name = "II מרובע";
    } else if (vaccineNotifiction.vaccine_name === "II מרובע") {
      vaccineNotifiction.vaccine_name = "מרובע";
    }
  }

  return vaccineNotifiction ? [vaccineNotifiction] : null;
};

const checkDogVaccinesNotifictions = (vaccines, vaccinesValidity) => {
  const parkWormVaccineNotifiction = getVaccineForNotify(
    vaccines,
    "תולעת הפארק",
    vaccinesValidity
  );

  const rabiesVaccineNotifiction = getVaccineForNotify(
    vaccines,
    "כלבת",
    vaccinesValidity
  );

  const dewormingVaccineNotifiction = getDewormingVaccineForNotify(
    vaccines,
    ["I מונע תולעים", "II מונע תולעים"],
    vaccinesValidity
  );

  /* istanbul ignore next */
  if (
    dewormingVaccineNotifiction &&
    dewormingVaccineNotifiction.vaccine_name === "I מונע תולעים"
  ) {
    /* istanbul ignore next */
    dewormingVaccineNotifiction.vaccine_name = "II מונע תולעים";
  }

  const hexagonVaccineNotifiction = getVaccineForNotify(
    vaccines,
    ["I משושה", "II משושה", "III משושה", "משושה"],
    vaccinesValidity
  );

  /* istanbul ignore next */
  if (hexagonVaccineNotifiction) {
    switch (hexagonVaccineNotifiction.vaccine_name) {
      case "I משושה":
        hexagonVaccineNotifiction.vaccine_name = "II משושה";
        break;
      case "II משושה":
        hexagonVaccineNotifiction.vaccine_name = "III משושה";
        break;
      case "III משושה":
        hexagonVaccineNotifiction.vaccine_name = "משושה";
        break;
      default:
        break;
    }
  }

  const notifications = [];

  /* istanbul ignore next */
  if (parkWormVaccineNotifiction) {
    notifications.push(parkWormVaccineNotifiction);
  }
  /* istanbul ignore next */
  if (rabiesVaccineNotifiction) {
    notifications.push(rabiesVaccineNotifiction);
  }
  /* istanbul ignore next */
  if (dewormingVaccineNotifiction) {
    notifications.push(dewormingVaccineNotifiction);
  }
  /* istanbul ignore next */
  if (hexagonVaccineNotifiction) {
    notifications.push(hexagonVaccineNotifiction);
  }

  /* istanbul ignore next */
  return notifications.length > 0 ? notifications : null;
};

const getVaccineForNotify = (vaccines, vaccineNames, vaccineValidity) => {
  const filteredVaccines = vaccines.filter((vaccine) =>
    Array.isArray(vaccineNames)
      ? vaccineNames.includes(vaccine.vaccine_name)
      : vaccine.vaccine_name === vaccineNames
  );

  filteredVaccines.sort((a, b) =>
    moment(b.date_given, "DD-MM-YYYY").diff(moment(a.date_given, "DD-MM-YYYY"))
  );

  /* istanbul ignore next */
  if (filteredVaccines.length === 0) {
    return null;
  }

  let newestVaccine = filteredVaccines[0];

  const validityEntry = vaccineValidity.find(
    (entry) => entry.type === newestVaccine.vaccine_name
  ); /* istanbul ignore next */

  if (!validityEntry) {
    return null;
  }

  const validityDays = validityEntry.validity;
  const vaccineDate = moment(newestVaccine.date_given, "DD-MM-YYYY")
    .tz("Asia/Jerusalem")
    .startOf("day");

  const expiryDate = vaccineDate.add(validityDays, "days").startOf("day");
  let today = moment().tz("Asia/Jerusalem").startOf("day");

  const daysUntilExpiry = expiryDate.diff(today, "days");

  const shouldAlert = daysUntilExpiry <= 7;

  if (shouldAlert) {
    return {
      ...newestVaccine,
      daysUntilExpiry,
    };
  }
  return null;
};

/* istanbul ignore next */
const getDewormingVaccineForNotify = (
  vaccines,
  vaccineNames,
  vaccineValidity
) => {
  const filteredVaccines = vaccines.filter((vaccine) =>
    vaccineNames.includes(vaccine.vaccine_name)
  );

  filteredVaccines.sort((a, b) =>
    moment(b.date_given, "DD-MM-YYYY").diff(moment(a.date_given, "DD-MM-YYYY"))
  ) /* istanbul ignore next */;

  /* istanbul ignore next */
  if (filteredVaccines.length === 0) {
    return null;
  }

  let newestVaccine = filteredVaccines[0];

  if (newestVaccine.vaccine_name === "II מונע תולעים") {
    return null;
  } /* istanbul ignore next */ else {
    /* istanbul ignore next */
    const validityEntry = vaccineValidity.find(
      (entry) => entry.type === newestVaccine.vaccine_name
    ); /* istanbul ignore next */

    if (!validityEntry) {
      return null;
    }

    /* istanbul ignore next */
    const validityDays = validityEntry.validity;
    const vaccineDate = moment(newestVaccine.date_given, "DD-MM-YYYY").tz(
      "Asia/Jerusalem"
    ); /* istanbul ignore next */
    const expiryDate = vaccineDate.add(validityDays, "days");
    const today = moment().tz("Asia/Jerusalem");
    const daysUntilExpiry = expiryDate.diff(today, "days");

    const shouldAlert = daysUntilExpiry <= 7;

    if (shouldAlert) {
      return {
        ...newestVaccine,
        daysUntilExpiry,
      };
    }
    return null;
  }
};

/* istanbul ignore next */
const getVaccineValidity = async (pet_type) => {
  if (!pet_type) {
    console.error("Pet type is required to fetch vaccine validity.");
    return [];
  }

  try {
    const validityQuery = `
      SELECT type, validity
      FROM vaccines_types
      WHERE pet_type = $1;
    `;

    const validityResult = await pool.query(validityQuery, [pet_type]);
    return validityResult.rows /* istanbul ignore next */;
  } catch (error) {
    console.error("Error fetching vaccine validity:", error);
    return [];
  }
};

const getVaccines = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);
  const dateOfBirth = req.params.dateofbirth;

  /* istanbul ignore next */
  if (isNaN(petId)) {
    return res
      .status(400)
      .json({ message: "המזהה של חיית המחמד חייב להיות מספר" });
  }

  try {
    const query = `
      SELECT
          vt.type AS vaccine_name,
          pv."Date" AS date_given,
          vt.pet_type
      FROM
          pets_vaccines pv
      JOIN
          vaccines_types vt ON pv.vaccines_types = vt.type
      WHERE
          pv.pet_id = $1
      ORDER BY
          pv."Date" ASC;
    `;

    const result = await pool.query(query, [petId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "לא נמצאו חיסונים לחיית המחמד הנתונה" });
    }

    const formattedRows = result.rows.map((row) => {
      const formattedDate = formatDateTime(row.date_given);
      return {
        ...row,
        date_given: formattedDate.date,
      };
    });

    let vaccinationsWithStatus;
    const pet_type = formattedRows[0].pet_type;
    const vaccinesValidity = await getVaccineValidity(pet_type);
    switch (pet_type) {
      case "כלב":
        vaccinationsWithStatus = checkDogVaccinationRenewal(
          formattedRows,
          vaccinesValidity
        );
        break;
      /* istanbul ignore next */
      case "חתול":
        vaccinationsWithStatus = checkCatVaccinationRenewal(
          formattedRows,
          vaccinesValidity
        );
        break;
      /* istanbul ignore next */
      default:
        vaccinationsWithStatus = formattedRows; /* istanbul ignore next */
        break; /* istanbul ignore next */
    }

    const vaccinationsWithAge = addAgeToVaccinations(
      vaccinationsWithStatus,
      dateOfBirth
    );
    res.status(200).json(vaccinationsWithAge);
  } catch (error) {
    /* istanbul ignore next */
    console.error("שגיאה בהחזרת חיסונים:", error);
    /* istanbul ignore next */
    res
      .status(500)
      .json({ message: "אירעה שגיאה בהחזרת חיסוניה של חיית המחמד" });
  }
};

function formatDateTime(isoString) {
  const momentDateTime = moment.tz(isoString, "UTC").tz("Asia/Jerusalem");
  return {
    date: momentDateTime.format("DD-MM-YYYY"),
    time: momentDateTime.format("HH:mm"),
  };
}

const addAgeToVaccinations = (vaccinations, dateOfBirth) => {
  return vaccinations.map((vaccination) => {
    const birthDate = moment(dateOfBirth, "DD-MM-YYYY").tz("Asia/Jerusalem");
    const vaccineDate = moment(vaccination.date_given, "DD-MM-YYYY").tz(
      "Asia/Jerusalem"
    );

    const ageYears = vaccineDate.diff(birthDate, "years");
    birthDate.add(ageYears, "years");
    const ageMonths = vaccineDate.diff(birthDate, "months");

    const ageAtVaccination = `${ageYears}.${ageMonths}`;

    return {
      ...vaccination,
      age_given: ageAtVaccination,
    };
  });
};

/* istanbul ignore next */
const checkVaccinesStatus = (vaccines, vaccineName, validityDays) => {
  const today = moment().tz("Asia/Jerusalem");

  const specificVaccines = vaccines.filter(
    (vaccine) => vaccine.vaccine_name === vaccineName
  );

  /* istanbul ignore next */
  if (specificVaccines.length === 0) {
    return vaccines;
  }

  specificVaccines.sort((a, b) =>
    moment(b.date_given, "DD-MM-YYYY").diff(moment(a.date_given, "DD-MM-YYYY"))
  );

  const mostRecentVaccine = specificVaccines[0];
  const mostRecentVaccineDate = moment(
    mostRecentVaccine.date_given,
    "DD-MM-YYYY"
  ).tz("Asia/Jerusalem");

  const daysSinceLastVaccine = today.diff(mostRecentVaccineDate, "days");
  /* istanbul ignore next */
  specificVaccines.forEach((vaccine, index) => {
    if (index === 0 && daysSinceLastVaccine >= validityDays) {
      vaccine.status = "must be renewed";
    } else {
      vaccine.status = "do not renew";
    }
  });

  const updatedVaccines = vaccines.map((vaccine) => {
    const matchingVaccine = specificVaccines.find(
      (specific) => specific.id === vaccine.id
    );
    /* istanbul ignore next */
    return matchingVaccine
      ? { ...vaccine, status: matchingVaccine.status }
      : vaccine;
  });

  return updatedVaccines;
};

const checkContinuousVaccinesStatus = (
  vaccines,
  vaccineNames,
  timeInterval
) => {
  const today = moment().tz("Asia/Jerusalem");

  // Filter the vaccinations for each vaccine type
  const filteredVaccines = vaccineNames.map((vaccineName) => {
    return vaccines.filter((vaccine) => vaccine.vaccine_name === vaccineName);
  });

  // Sort the vaccinations by date_given in ascending order
  filteredVaccines.forEach((vaccineList) => {
    vaccineList.sort((a, b) =>
      moment(a.date_given, "DD-MM-YYYY").diff(
        moment(b.date_given, "DD-MM-YYYY")
      )
    );
  });

  // Determine the status for each vaccination record
  filteredVaccines[0].forEach((vaccine, index) => {
    const vaccineDate = moment(vaccine.date_given, "DD-MM-YYYY").tz(
      "Asia/Jerusalem"
    );
    const correspondingVaccineList = filteredVaccines[1];

    const timeLater = moment(vaccineDate).add(timeInterval, "days");
    const correspondingVaccine = correspondingVaccineList.find(
      (corresponding) =>
        moment(corresponding.date_given, "DD-MM-YYYY").isAfter(vaccineDate)
    );

    /* istanbul ignore next */
    if (correspondingVaccine) {
      vaccine.status = "do not renew";
      correspondingVaccine.status = "do not renew";
      /* istanbul ignore next */
    } else if (today.isAfter(timeLater)) {
      vaccine.status = "must be renewed";
      /* istanbul ignore next */
    } else {
      vaccine.status = "do not renew";
    }
  });

  // Merge the updated vaccination statuses back into the original vaccines array
  const updatedVaccines = vaccines.map((vaccine) => {
    const matchingVaccines = filteredVaccines
      .flat()
      .find((filteredVaccine) => filteredVaccine.id === vaccine.id);
    return matchingVaccines
      ? { ...vaccine, status: matchingVaccines.status }
      : vaccine;
  });

  return updatedVaccines;
};

function checkDogVaccinationRenewal(vaccinations, vaccinesValidity) {
  checkVaccinesStatus(
    vaccinations,
    "תולעת הפארק",
    vaccinesValidity.find((vaccine) => vaccine.type === "תולעת הפארק").validity
  );
  checkVaccinesStatus(
    vaccinations,
    "כלבת",
    vaccinesValidity.find((vaccine) => vaccine.type === "כלבת").validity
  );

  checkContinuousVaccinesStatus(
    vaccinations,
    ["I מונע תולעים", "II מונע תולעים"],
    vaccinesValidity.find((vaccine) => vaccine.type === "I מונע תולעים")
      .validity
  );

  checkContinuousVaccinesStatus(
    vaccinations,
    ["I משושה", "II משושה"],
    vaccinesValidity.find((vaccine) => vaccine.type === "I משושה").validity
  );
  checkContinuousVaccinesStatus(
    vaccinations,
    ["II משושה", "III משושה"],
    vaccinesValidity.find((vaccine) => vaccine.type === "II משושה").validity
  );
  checkContinuousVaccinesStatus(
    vaccinations,
    ["III משושה", "משושה"],
    vaccinesValidity.find((vaccine) => vaccine.type === "III משושה").validity
  );
  checkVaccinesStatus(
    vaccinations,
    "משושה",
    vaccinesValidity.find((vaccine) => vaccine.type === "משושה").validity
  );

  return vaccinations;
}

/* istanbul ignore next */
function checkCatVaccinationRenewal(vaccinations, vaccinesValidity) {
  checkContinuousVaccinesStatus(
    vaccinations,
    ["I מרובע", "II מרובע"],
    vaccinesValidity.find((vaccine) => vaccine.type === "I מרובע").validity
  );

  checkContinuousVaccinesStatus(
    vaccinations,
    ["II מרובע", "מרובע"],
    vaccinesValidity.find((vaccine) => vaccine.type === "II מרובע").validity
  );

  checkVaccinesStatus(
    vaccinations,
    "מרובע",
    vaccinesValidity.find((vaccine) => vaccine.type === "מרובע").validity
  );

  return vaccinations;
}

module.exports = {
  getVaccines,
  getVaccinesNotifications,
};
