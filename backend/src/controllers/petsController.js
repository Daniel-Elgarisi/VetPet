const pool = require("../config/db");

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
      console.log(petsData);
      res.status(200).json(petsData);
    }

    // console.log(pets.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("שגיאה בהחזרת חיות מחמד לבעלים.");
  }
};

module.exports = {
  getPetsByOwnerId,
};
