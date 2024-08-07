const { client } = require("../config/paypalClient");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const {
  sendPaymentConfirmationEmail,
} = require("../utils/paymentEmailService");
const pool = require("../config/db");

const createOrder = async (req, res) => {
  const ownerId = parseInt(req.params.id, 10);
  const petId = parseInt(req.params.pet_id, 10);
  const paymentDescription = req.body.description;
  if (!ownerId || !petId) {
    return res
      .status(400)
      .send({ message: "חסר מידע אודות חיית המחמד או הבעלים." });
  }

  if (isNaN(ownerId) || isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "מזהה בעלים או חיית מחמד לא תקינים." });
  }

  const amount = "120.00";
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "ILS",
          value: amount,
          breakdown: {
            item_total: {
              currency_code: "ILS",
              value: amount,
            },
          },
        },
        description: paymentDescription,
        items: [
          {
            name: paymentDescription,
            description: paymentDescription,
            unit_amount: {
              currency_code: "ILS",
              value: amount,
            },
            quantity: "1",
          },
        ],
      },
    ],
    application_context: {
      return_url: "https://localhost:5000/paypal/success",
      cancel_url: "https://localhost:5000/paypal/cancel",
    },
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Error creating PayPal order:", err);
    res
      .status(500)
      .send({ message: "Error creating PayPal order", error: err });
  }
};

const captureOrder = async (req, res) => {
  const { orderID, owner_id, petName, pet_id, description } = req.body;
  const ownerId = parseInt(owner_id);
  const petId = parseInt(pet_id);

  console.log(petId + "dsa: " + description);

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

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    if (capture.result.status === "COMPLETED") {
      const transaction = capture.result.purchase_units[0].payments.captures[0];
      const amount = transaction.amount.value;
      const currency = transaction.amount.currency_code;
      const status = transaction.status;
      const transactionId = transaction.id;
      const paymentMethod = "PayPal";

      await pool.query(
        `INSERT INTO transactions (owner_id, pet_id, transaction_id, amount, currency, status, created_at, description, payment_method) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)`,
        [
          owner_id,
          petId,
          transactionId,
          amount,
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
        120,
        ownerName,
        petName,
        orderID
      );

      return res.status(200).json({ capture: capture.result });
    }
  } catch (err) {
    console.error("Error capturing PayPal order:", err);
    res
      .status(500)
      .send({ message: "Error capturing PayPal order", error: err });
  }
};

const updateSubscription = async (req, res) => {
  const petId = parseInt(req.params.pet_id, 10);

  if (!petId) {
    return res.status(400).send({ message: "חסר מידע אודות חיית המחמד." });
  }

  if (isNaN(petId)) {
    return res
      .status(400)
      .send({ message: "המזהה של חיית המחמד חייב להיות מספר." });
  }

  try {
    const today = new Date();
    let subscriptionDateQuery = await pool.query(
      `SELECT subscription_date FROM pets_profile WHERE id = $1`,
      [petId]
    );

    if (subscriptionDateQuery.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "לא נמצאה חיית מחמד עם המזהה שצוין." });
    }

    let subscriptionDate = new Date(
      subscriptionDateQuery.rows[0].subscription_date
    );
    console.log("Old Subscription Date:", subscriptionDate);

    let subscriptionEndDate = new Date(subscriptionDate);
    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    console.log("Subscription End Date:", subscriptionEndDate);
    console.log("Today's Date:", today);

    if (subscriptionEndDate > today) {
      subscriptionDate = new Date(subscriptionEndDate);
    } else {
      subscriptionDate = today;
    }

    await pool.query(
      `UPDATE pets_profile SET subscription_date = $1, subscription = $2 WHERE id = $3`,
      [subscriptionDate, true, petId]
    );

    console.log("New Subscription Date:", subscriptionDate);

    return res.status(200).send({ message: "המינוי עודכן בהצלחה." });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return res.status(500).send({ message: "אירעה שגיאה בעת עדכון המינוי." });
  }
};

module.exports = { createOrder, captureOrder, updateSubscription };
