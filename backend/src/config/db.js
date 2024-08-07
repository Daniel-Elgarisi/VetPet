const { Pool } = require("pg");

/* istanbul ignore next */
if (process.env.NODE_ENV === "test") {
  require("dotenv").config({ path: "./.env.test" });
} else {
  /* istanbul ignore next */
  require("dotenv").config();
}

const dbConfig = {
  test: {
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    host: process.env.TEST_DB_HOST,
    port: process.env.TEST_DB_PORT,
    database: process.env.TEST_DB_DATABASE,
  },
  development: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
  },
};

/* istanbul ignore next */
const currentConfig = dbConfig[process.env.NODE_ENV || "development"];

const pool = new Pool(currentConfig);

module.exports = pool;
