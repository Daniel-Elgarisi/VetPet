require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const app = express();
const cors = require("cors");
const ownersRoutes = require("./api/routes/ownersRoutes");
const petsRoutes = require("./api/routes/petsRoutes");
const authRoutes = require("./api/routes/authRoutes");
const port = process.env.PORT || 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from VetPet Backend!");
});
app.use(cors());
app.use("/pets", petsRoutes);
app.use("/owners", ownersRoutes);
app.use("/auth", authRoutes);

app.get("/test-db", async (req, res) => {
  try {
    const testQuery = await pool.query("SELECT NOW()");
    res.json(testQuery.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error when testing database connection");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
