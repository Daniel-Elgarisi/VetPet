const { stripe } = require("../config/stripeClient");
const { sendPaymentConfirmationEmail, } = require("../utils/paymentEmailService");
const pool = require("../config/db");

const createPaymentIntent = async (req, res) => {
  const { amount, currency, description } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency,
      description,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
};

const captureOrder = async (req, res) => {
  const { owner_id, petName, pet_id, description, paymentIntent } = req.body;
  const ownerId = parseInt(owner_id);
  const petId = parseInt(pet_id);

  if (!ownerId || !petName || !petId) {
    return res
      .status(400)
      .send({ message: "חסר מידע אודות חיית המחמד או הבעלים." });
  }

  if (isNaN(ownerId) || isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של הבעלים או חיית המחמד חייב להיות מספר." });
  }

  const amount = paymentIntent.amount / 100;
  const amountToFixed = amount.toFixed(2);
  const currency = paymentIntent.currency.toUpperCase();
  const transactionId = paymentIntent.id;
  let status = '';
  if (paymentIntent.status === 'Succeeded')
    status = 'COMPLETED';
  const paymentMethod = 'Credit Card';
  try {
    await pool.query(
      `INSERT INTO transactions (owner_id, pet_id, transaction_id, amount, currency, status, created_at, description, payment_method) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)`,
      [
        owner_id,
        petId,
        transactionId,
        amountToFixed,
        currency,
        status,
        description,
        paymentMethod,
      ]
    );

    const owner = await pool.query(
      `SELECT name, email FROM owners_profile WHERE id = $1`,
      [ownerId]
    );

    const ownerEmail = owner.rows[0].email;
    const ownerName = owner.rows[0].name;

    await sendPaymentConfirmationEmail(
      ownerEmail,
      amount,
      ownerName,
      petName,
      transactionId
    );

    return res.status(200).json({ message: "התשלום בוצע בהצלחה." });
  } catch (err) {
    console.error("Error capturing PayPal order:", err);
    res
      .status(500)
      .send({ message: "Error capturing PayPal order", error: err });
  }
};

module.exports = { createPaymentIntent, captureOrder };
