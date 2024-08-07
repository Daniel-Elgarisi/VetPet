const pool = require("../../config/db");
const { otpStore } = require("./verifyIdAndSendCode");

const verifyOtpCode = async (req, res) => {
  const { code, identity_number } = req.body;

  let storedData = otpStore[identity_number];
  if (!storedData) {
    return res
      .status(404)
      .send({ message: "לא נמצאו נתוני אימות או שתוקף קוד האימות פג." });
  }

  if (Date.now() > storedData.expiry) {
    return res.status(408).send({ message: "תוקף קוד האימות פג." });
  }

  if (code === storedData.code.toString()) {
    try {
      const query = "SELECT id FROM owners_profile WHERE identity_number = $1";
      const { rows } = await pool.query(query, [identity_number]);
      if (rows.length > 0) {
        const ownerId = rows[0].id;
        console.log(ownerId);
        res.status(200).send({
          message: "הקוד אומת בהצלחה, מתחבר...",
          ownerId: ownerId,
        });
      } else {
        res.status(404).send({ message: "לא נמצא משתמש עם מספר זהות זה." });
      }
    } catch (error) {
      console.error("Database query error", error);
      res.status(500).send({ message: "שגיאה בשרת בעת ניסיון לאימות הקוד." });
    }
    delete otpStore[identity_number];
  } else {
    res.status(400).send({ message: "קוד אימות לא חוקי." });
  }
};

const verifyVetOtpCode = async (req, res) => {
  const { code, license } = req.body;

  let storedData = otpStore[license];

  if (!storedData) {
    return res
      .status(404)
      .send({ message: "לא נמצאו נתוני אימות או שתוקף קוד האימות פג." });
  }

  if (Date.now() > storedData.expiry) {
    return res.status(408).send({ message: "תוקף קוד האימות פג." });
  }

  if (code === storedData.code.toString()) {
    try {
      const query = "SELECT id FROM doctor_profile WHERE license = $1";
      const { rows } = await pool.query(query, [license]);
      if (rows.length > 0) {
        const vetId = rows[0].id;
        console.log(vetId);
        res.status(200).send({
          message: "הקוד אומת בהצלחה, מתחבר...",
          vetId: vetId,
        });
      } else {
        res.status(404).send({ message: "לא נמצא וטרינר עם מספר רישיון זה." });
      }
    } catch (error) {
      console.error("Database query error", error);
      res.status(500).send({ message: "שגיאה בשרת בעת ניסיון לאימות הקוד." });
    }
    delete otpStore[license];
  } else {
    res.status(400).send({ message: "קוד אימות לא חוקי." });
  }
};

module.exports = { verifyOtpCode, verifyVetOtpCode };
