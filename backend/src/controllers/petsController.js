const pool = require("../config/db");
const moment = require("moment-timezone");

const getPetsByOwnerId = async (req, res) => {
  const ownerId = req.params.id;

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

    if (pets.rows.length === 0) {
      return res.status(404).send("לא נמצאו חיות מחמד עבור בעלים זה.");
    } else {
      const petsData = pets.rows.map((pet) => ({
        id: pet.id,
        name: pet.name,
      }));
      res.status(200).json(petsData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("שגיאה בהחזרת חיות מחמד לבעלים.");
  }
};

const getFullPetInformation = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (isNaN(petId)) {
    return res.status(400).send({ message: "petId ID must be a number." });
  }

  try {
    const pets = await pool.query(
      `SELECT name, sex, pet_type, breed, weight, chip_number, dateofbirth
       FROM pets_profile WHERE id = $1`,
      [petId]
    );

    if (pets.rows.length === 0) {
      return res.status(404).send("No pets found for this owner.");
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
      }));
      res.status(200).json(petsData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving pets for the owner.");
  }
};

module.exports = {
  getPetsByOwnerId,
  getFullPetInformation,
};
