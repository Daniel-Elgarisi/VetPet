require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const app = express();
const cors = require("cors");

//routes
const ownersRoutes = require("./api/routes/ownersRoutes");
const petsRoutes = require("./api/routes/petsRoutes");
const authRoutes = require("./api/routes/authRoutes");
const appointmentsRoutes = require("./api/routes/appointmentsRoutes");

const port = process.env.PORT || 5000;

app.use(express.json());

app.use(cors());
app.use("/pets", petsRoutes);
app.use("/owners", ownersRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentsRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
