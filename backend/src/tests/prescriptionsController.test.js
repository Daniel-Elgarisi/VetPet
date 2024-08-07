const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("Prescriptions API Integration Tests", () => {
  describe("GET /prescriptions/get-prescriptions-detail/:pet_id", () => {
    it("should return status 200 OK and prescriptions for a valid pet ID", async () => {
      const petId = 2; // Ensure this pet ID exists and has prescriptions in your test database
      const res = await request(app).get(
        `/prescriptions/get-prescriptions-detail/${petId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body[0]).toHaveProperty("medicine");
      expect(res.body[0]).toHaveProperty("doctor_name");
    });

    it("should return 404 Not Found if no prescriptions exist for the given pet", async () => {
      const petId = 3; // Ensure this pet ID does not have any prescriptions in your test database
      const res = await request(app).get(
        `/prescriptions/get-prescriptions-detail/${petId}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "שגיאה בהחזרת מרשמים לחיית המחמד: Pet not found" // Update this message to match the current API response
      );
    });

    it("should return 400 if pet_id is not a number", async () => {
      const petId = "invalid";
      const res = await request(app).get(
        `/prescriptions/get-prescriptions-detail/${petId}`
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "המזהה של חיית המחמד חייב להיות מספר."
      );
    });

    it("should return 404 if pet is not found", async () => {
      const petId = 9999; // Ensure this pet ID does not exist in your test database
      const res = await request(app).get(
        `/prescriptions/get-prescriptions-detail/${petId}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "שגיאה בהחזרת מרשמים לחיית המחמד: Pet not found"
      );
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await pool.end();
  });
});
