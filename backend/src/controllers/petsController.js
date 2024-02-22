const pool = require("../config/db");

const getPetsByOwnerId = async (req, res) => {
  const ownerId = req.params.id;
  console.log(req.params.id);
  if (isNaN(ownerId)) {
    return res.status(400).send("Owner ID must be a number");
  }
  try {
    const pets = await pool.query(
      "SELECT * FROM pets_profile WHERE owner_id = $1",
      [ownerId]
    );

    if (pets.rows.length === 0) {
      return res.status(404).send("No pets found for the given owner ID");
    }

    res.json(pets.rows);
    console.log(pets.rows[0].name);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error when fetching pets");
  }
};

module.exports = {
  getPetsByOwnerId,
};
