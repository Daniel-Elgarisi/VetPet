const pool = require("../config/db");
const moment = require("moment");

/* istanbul ignore next */
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
    /* istanbul ignore next */
    if (value !== null && value !== undefined) {
      updateFields.push(`${key} = $${index}`);
      updateValues.push(value);
      index++;
    }
  }
  /* istanbul ignore next */
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
    /* istanbul ignore next */
    console.error("שגיאה בעדכון פרטים אישיים: ", error);
    /* istanbul ignore next */
    res.status(500).send("שגיאה בעדכון פרטים אישיים");
  }
};

const getOwnerDetails = async (req, res) => {
  const ownerId = req.params.id;
  console.log(ownerId);

  try {
    const ownerDetails = await pool.query(
      "SELECT name, identity_number, phone_number, city, street, apartment_number, email FROM owners_profile WHERE id = $1",
      [ownerId]
    );
    if (ownerDetails.rowCount === 0) {
      return res.status(404).send("לא נמצא בעל חיית מחמד");
    }
    res.json(ownerDetails.rows[0]);
  } catch (error) {
    /* istanbul ignore next */
    console.error("שגיאה בהבאת מידע על בעל חיית המחמד: ", error);
    /* istanbul ignore next */
    res.status(500).send("שגיאה בהבאת מידע על בעל חיית המחמד");
  }
};

const getTransactionsForOwner = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10); /* istanbul ignore next */

  /* istanbul ignore next */
  if (!ownerId) {
    return res.status(400).send({ message: "חסר מידע אודות הבעלים." });
  }
  /* istanbul ignore next */
  if (isNaN(ownerId)) {
    return res
      .status(400)
      .send({ message: "המזהה של הבעלים חייב להיות מספר." });
  }

  try {
    const transactions = await pool.query(
      `SELECT t.id, t.owner_id, t.pet_id, t.transaction_id, t.amount, t.currency, t.status, t.created_at, t.description ,t.payment_method
       FROM transactions t
       JOIN owners_profile o ON t.owner_id = o.id
       WHERE o.id = $1`,
      [ownerId]
    );

    if (transactions.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "לא נמצאו עסקאות עבור בעל החיית מחמד." });
    }

    const formattedTransactions = transactions.rows.map((transaction) => ({
      ...transaction,
      created_at: moment(transaction.created_at).format("DD-MM-YYYY"),
    })); /* istanbul ignore next */

    return res
      .status(200)
      .json(formattedTransactions); /* istanbul ignore next */
  } catch (error) {
    /* istanbul ignore next */
    console.error(error);
    /* istanbul ignore next */
    res
      .status(500)
      .send({ message: "שגיאה בהבאת עסקאות עבור בעל החיית מחמד." });
  }
};

module.exports = {
  getOwners,
  editOwnersProfile,
  getOwnerDetails,
  getTransactionsForOwner,
};
