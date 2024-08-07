const pool = require("../config/db");

const editVetsProfile = async (req, res) => {
  const vetId = parseInt(req.params.id, 10);

  if (!vetId) {
    return res.status(400).send({ message: "חסר מידע אודות הוטרינר." });
  }

  /* istanbul ignore next */
  if (isNaN(vetId)) {
    /* istanbul ignore next */
    return res
      .status(400)
      .send({ message: "המזהה של הוטרינר חייב להיות מספר." });
  }

  try {
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
      /* istanbul ignore next */
      return res.status(400).send("לא בוצעו שינויים");
    }
    updateValues.push(vetId);

    const updateQuery = `
      UPDATE doctor_profile
      SET ${updateFields.join(", ")}
      WHERE id = $${index}
      RETURNING *;
    `;

    const updateVet = await pool.query(updateQuery, updateValues);
    if (updateVet.rowCount === 0) {
      return res.status(404).send("לא נמצא הוטרינר");
    }
    res.status(200).json({
      message: "Vet was updated",
      vet: updateVet.rows[0],
    });
  } catch (error) {
    /* istanbul ignore next */
    console.error("שגיאה בעדכון פרטים אישיים: ", error);
    /* istanbul ignore next */
    return res.status(500).send("שגיאה בעת עדכון הוטרינר");
  }
};

const getVetDetails = async (req, res) => {
  const vetId = parseInt(req.params.id, 10);

  if (!vetId) {
    /* istanbul ignore next */
    return res.status(400).send({ message: "חסר מידע אודות הוטרינר." });
  }

  /* istanbul ignore next */
  if (isNaN(vetId)) {
    /* istanbul ignore next */
    return res
      .status(400)
      .send({ message: "המזהה של הוטרינר חייב להיות מספר." });
  }

  try {
    const vetDetails = await pool.query(
      "SELECT name, license, email, phone_number, gender FROM doctor_profile WHERE id = $1",
      [vetId]
    );

    if (vetDetails.rowCount === 0) {
      return res.status(404).send("לא נמצא הוטרינר");
    }

    res.json(vetDetails.rows[0]);
  } catch (error) {
    /* istanbul ignore next */
    console.error("שגיאה בהבאת מידע על הוטרינר: ", error);
    /* istanbul ignore next */
    return res.status(500).send("שגיאה בהבאת מידע על הוטרינר");
  }
};

module.exports = {
  editVetsProfile,
  getVetDetails,
};
