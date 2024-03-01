const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("Owners API Integration Tests", () => {
  describe("POST /owners/edit-ownersProfile/:id", () => {
    it("should return 400 Bad Request for invalid owner ID", async () => {
      const res = await request(app)
        .post("/owners/edit-ownersProfile/not-a-number")
        .send({ email: "dsada@gmail.com" });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 404 Not Found for a non-existent owner ID", async () => {
      const res = await request(app)
        .post("/owners/edit-ownersProfile/9999")
        .send({ name: "Owner Name" });
      expect(res.statusCode).toBe(404);
    });

    it("should return 200 OK and the updated owner for a valid owner ID", async () => {
      const updateData = {
        email: "updatedemail@example.com",
      };

      const res = await request(app)
        .post(`/owners/edit-ownersProfile/${testOwnerId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Owner was updated");
      expect(res.body).toHaveProperty("owner");
      expect(res.body.owner).toMatchObject(updateData);
    });
  });

  let uniqueIdentityNumber;
  let testOwnerId;
  beforeAll(async () => {
    uniqueIdentityNumber = Math.floor(Math.random() * 1000000000);
    const insertRes = await pool.query(
      `INSERT INTO owners_profile (name, identity_number, phone_number, credit_4_digit, country, city, street, apartment_number, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id;`,
      [
        "Test User",
        uniqueIdentityNumber,
        "0521234567",
        "1234",
        "Test Country",
        "Test City",
        "Test Street",
        "3",
        "test@test.com",
      ]
    );
    testOwnerId = insertRes.rows[0].id;
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await pool.end();
  });
});
