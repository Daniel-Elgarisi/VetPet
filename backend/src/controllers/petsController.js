const pool = require("../config/db");
const moment = require("moment-timezone");

/* istanbul ignore next */
const getPotentialPetSubscriptionsByOwnerId = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);

  if (isNaN(ownerId) || !ownerId) {
    return res
      .status(400)
      .send({ message: "המזהה של הבעלים חייב להיות מספר." });
  }

  try {
    const pets = await pool.query(
      `SELECT id, name, pet_type, subscription_date
       FROM pets_profile
       WHERE owner_id = $1 AND subscription IS NULL`,
      [ownerId]
    );

    if (pets.rows.length === 0) {
      return res.status(404).send({ message: "לא נמצאו חיות מחמד לבעלים." });
    }

    return res.status(200).json(pets.rows);
  } catch (error) {
    /* istanbul ignore next */
    console.error(error);
    /* istanbul ignore next */
    res.status(500).send({ message: "שגיאה בהחזרת חיות מחמד לבעלים." });
  }
};

/* istanbul ignore next */
const cancelPetSubscription = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (isNaN(petId) || !petId) {
    return res
      .status(400)
      .send({ message: "המזהה של הבעלים חייב להיות מספר." });
  }

  try {
    const pet = await pool.query(
      `UPDATE pets_profile SET subscription = NULL
       WHERE id = $1 RETURNING *`,
      [petId]
    );

    if (pet.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "לא נמצאה חיית מחמד עם המזהה שצוין." });
    }

    return res.status(200).send({ message: "המינוי בוטל בהצלחה." });
  } catch (error) {
    /* istanbul ignore next */
    console.error(error);
    /* istanbul ignore next */
    return res.status(500).send({ message: "שגיאה בביטול המינוי." });
  }
};

const getPetsByOwnerId = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);

  if (isNaN(ownerId)) {
    return res
      .status(400)
      .send({ meesage: "המזהה של הבעלים חייב להיות מספר." });
  }

  try {
    const pets = await pool.query(
      "SELECT * FROM pets_profile WHERE owner_id = $1",
      [ownerId]
    );
    /* istanbul ignore next */
    if (pets.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "לא נמצאו חיות מחמד עבור בעלים זה." });
    } else {
      const petsData = pets.rows.map((pet) => ({
        id: pet.id,
        name: pet.name,
      }));
      res.status(200).json(petsData);
    }
  } catch (error) {
    /* istanbul ignore next */
    console.error(error);
    /* istanbul ignore next */
    res.status(500).send({ message: "שגיאה בהחזרת חיות מחמד לבעלים." });
  }
};

const getFullPetInformation = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של הבעלים חייב להיות מספר." });
  }

  try {
    const pets = await pool.query(
      `SELECT name, sex, pet_type, breed, weight, chip_number, dateofbirth, subscription, subscription_date
       FROM pets_profile WHERE id = $1`,
      [petId]
    );

    /* istanbul ignore next */
    if (pets.rows.length === 0) {
      return res.status(404).send({
        message: "לא נמצאו חיות מחמד עבור בעלים זה.",
      }); /* istanbul ignore next */
      /* istanbul ignore next */
    } else {
      const petsData = pets.rows.map((pet) => ({
        name: pet.name,
        age: moment().diff(moment(pet.dateofbirth), "years", true).toFixed(1),
        sex: pet.sex,
        pet_type: pet.pet_type,
        breed: pet.breed,
        weight: pet.weight,
        dateofbirth: moment(pet.dateofbirth).format("DD-MM-YYYY"),
        chip_number: pet.chip_number,
        subscription: pet.subscription,
        subscription_date: pet.subscription_date,
      }));
      res.status(200).json(petsData);
    }
  } catch (error) {
    /* istanbul ignore next */
    console.error(error);
    /* istanbul ignore next */
    res.status(500).send({ message: "שגיאה בהחזרת חיות מחמד לבעלים." });
  }
};

/* istanbul ignore next */
const getSubscriptionPetsByOwnerId = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);

  if (isNaN(ownerId)) {
    return res
      .status(400)
      .send({ meesage: "המזהה של הבעלים חייב להיות מספר." });
  }

  try {
    const pets = await pool.query(
      `SELECT id, name, pet_type, subscription, subscription_date
       FROM pets_profile 
       WHERE owner_id = $1 AND subscription IS NOT NULL`,
      [ownerId]
    );

    console.log(pets.rows);

    if (pets.rows.length === 0) {
      return res
        .status(404)
        .json({ meesaage: "לא נמצאו חיות מחמד עם מינויים." });
    }

    const now = moment().tz("Asia/Jerusalem");

    const petsData = pets.rows.map((pet) => {
      const subscriptionDate = moment(pet.subscription_date).tz(
        "Asia/Jerusalem"
      );
      const renewalDate = subscriptionDate.clone().add(1, "year");

      return {
        ...pet,
        renewalDate,
      };
    });

    const expiredSubscriptions = petsData.filter((pet) => {
      return now.isAfter(pet.renewalDate);
    });

    if (expiredSubscriptions.length > 0) {
      const expiredPetIds = expiredSubscriptions.map((pet) => pet.id);
      await pool.query(
        `UPDATE pets_profile SET subscription = false WHERE id = ANY($1::int[])`,
        [expiredPetIds]
      );
    }

    const petsToRenew = petsData.filter((pet) => {
      return now.isSameOrAfter(pet.renewalDate.clone().subtract(1, "week"));
    });

    return res.status(200).json(petsToRenew);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "שגיאה בהחזרת חיות מחמד לבעלים." });
  }
};

module.exports = {
  getPetsByOwnerId,
  getFullPetInformation,
  getSubscriptionPetsByOwnerId,
  cancelPetSubscription,
  getPotentialPetSubscriptionsByOwnerId,
};
