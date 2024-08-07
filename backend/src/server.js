require("dotenv").config();
const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// Load SSL certificate and key
const key = fs.readFileSync(path.join(__dirname, "decrypted_key.pem"));
const cert = fs.readFileSync(path.join(__dirname, "cert.crt"));

//routes
const ownersRoutes = require("./api/routes/ownersRoutes");
const petsRoutes = require("./api/routes/petsRoutes");
const authRoutes = require("./api/routes/authRoutes");
const appointmentsRoutes = require("./api/routes/appointmentsRoutes");
const vaccineRoutes = require("./api/routes/vaccineRoutes");
const medicalTestsResultsRoutes = require("./api/routes/medicalTestsResultsRoutes");
const notificationsCountRoutes = require("./api/routes/notificationsCountRoutes");
const paypalRoutes = require("./api/routes/paypalRoutes");
const stripeRoutes = require("./api/routes/stripeRoutes");
const prescriptionsRoutes = require("./api/routes/prescriptionsRoutes");
const recordsRoutes = require("./api/routes/recordsRoutes");
const referencesRoutes = require("./api/routes/referencesRoutes");
const vetsRoutes = require("./api/routes/vetRoutes");

app.use(cors());
app.use(express.json());

app.use("/pets", petsRoutes);
app.use("/owners", ownersRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/vaccines", vaccineRoutes);
app.use("/medicalTestsResults", medicalTestsResultsRoutes);
app.use("/notifications", notificationsCountRoutes);
app.use("/paypal", paypalRoutes);
app.use("/stripe", stripeRoutes);
app.use("/prescriptions", prescriptionsRoutes);
app.use("/records", recordsRoutes);
app.use("/references", referencesRoutes);
app.use("/vets", vetsRoutes);

let server;
/* istanbul ignore if */
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 5000;
  server = http.createServer({ key, cert }, app).listen(port, () => {
    console.log(`HTTP Server running at http://localhost:${port}`);
  });
}

module.exports = { app, server };
