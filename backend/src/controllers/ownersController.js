const pool = require("../config/db");

const getOwners = async (req, res) => {
  try {
    const owners = await pool.query("SELECT * FROM owners_profile");
    res.json(owners.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error when fetching owners");
  }
};

const editOwnersProfile = async (req, res) => {
  const { phone_number, city, street, apartment_number, identity_number } =
    req.body;

  if (
    !phone_number ||
    !city ||
    !street ||
    !apartment_number ||
    !identity_number
  ) {
    return res.status(400).send("Missing fields");
  }
  try {
    const updateOwner = await pool.query(
      "UPDATE owners_profile SET phone_number = $1, city = $2, street = $3, apartment_number = $4 WHERE identity_number = $5 RETURNING *",
      [phone_number, city, street, apartment_number, identity_number]
    );
    if (updateOwner.rowCount === 0) {
      return res.status(404).send("Owner not found");
    }

    console.log(updateOwner.rows[0]);

    res.json({
      message: "Owner was updated",
      owner: updateOwner.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error when updating owner");
  }
};

module.exports = {
  getOwners,
  editOwnersProfile,
};
