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
  const ownerId = parseInt(req.params.id, 10);

  if (isNaN(ownerId)) {
    return res
      .status(400)
      .send({ message: "המזהה של הבעלים חייב להיות מספר." });
  }

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

  if (updateFields.length === 0) {
    return res.status(400).send("לא בוצעו שינויים");
  }
  updateValues.push(ownerId);

  const updateQuery = `
    UPDATE owners_profile
    SET ${updateFields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
  `;

  try {
    const updateOwner = await pool.query(updateQuery, updateValues);
    if (updateOwner.rowCount === 0) {
      return res.status(404).send("לא נמצא בעל חיית מחמד");
    }
    res.status(200).json({
      message: "Owner was updated",
      owner: updateOwner.rows[0],
    });
  } catch (error) {
    console.error("שגיאה בעדכון פרטים אישיים: ", error);
    res.status(500).send("שגיאה בעדכון פרטים אישיים");
  }
};

const getOwnerDetails = async (req, res) => {
  const ownerId = req.params.id;
  console.log(ownerId);

  try {
    const ownerDetails = await pool.query(
      "SELECT phone_number, city, street, apartment_number, email FROM owners_profile WHERE id = $1",
      [ownerId]
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
