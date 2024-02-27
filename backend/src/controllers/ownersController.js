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
  const { identity_number } = req.params;
  const updates = req.body;

  let updateFields = [];
  let updateValues = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== null && value !== undefined) {
      updateFields.push(`${key} = $${index}`);
      updateValues.push(value);
      index++;
    }
  }
  console.log(updateFields, updateValues, identity_number);

  if (updateFields.length === 0) {
    return res.status(400).send("לא בוצעו שינויים");
  }
  updateValues.push(identity_number);

  const updateQuery = `
    UPDATE owners_profile
    SET ${updateFields.join(", ")}
    WHERE identity_number = $${index}
    RETURNING *;
  `;

  try {
    const updateOwner = await pool.query(updateQuery, updateValues);
    if (updateOwner.rowCount === 0) {
      return res.status(404).send("לא נמצא בעל חיית מחמד");
    }
    res.json({
      message: "Owner was updated",
      owner: updateOwner.rows[0],
    });
  } catch (error) {
    console.error("שגיאה בעדכון פרטים אישיים: ", error);
    res.status(500).send("שגיאה בעדכון פרטים אישיים");
  }
};

const getOwnerDetails = async (req, res) => {
  const { identity_number } = req.params;

  try {
    const ownerDetails = await pool.query(
      "SELECT phone_number, city, street, apartment_number, email FROM owners_profile WHERE identity_number = $1",
      [identity_number]
    );
    if (ownerDetails.rowCount === 0) {
      return res.status(404).send("לא נמצא בעל חיית מחמד");
    }
    res.json(ownerDetails.rows[0]);
  } catch (error) {
    console.error("שגיאה בהבאת מידע על בעל חיית המחמד: ", error);
    res.status(500).send("שגיאה בהבאת מידע על בעל חיית המחמד");
  }
};

module.exports = {
  getOwners,
  editOwnersProfile,
  getOwnerDetails,
};
