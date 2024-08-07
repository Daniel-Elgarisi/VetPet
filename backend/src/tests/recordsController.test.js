const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("Records API Integration Tests", () => {
  describe("GET /records/get-records/:pet_id", () => {
    it("should return status 200 OK and records for a valid pet ID", async () => {
      const petId = 2; // Ensure this pet ID exists and has records in your test database
      const res = await request(app).get(`/records/get-records/${petId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("pet");
      expect(res.body).toHaveProperty("records");
      expect(res.body.records).toBeInstanceOf(Array);
      if (res.body.records.length > 0) {
        expect(res.body.records[0]).toHaveProperty("diagnosis");
        expect(res.body.records[0]).toHaveProperty("prescriptions");
        expect(res.body.records[0].prescriptions).toBeInstanceOf(Array);
      }
    });

    it("should return 404 Not Found if no records exist for the given pet", async () => {
      const petId = 9999; // Ensure this pet ID does not exist in your test database
      const res = await request(app).get(`/records/get-records/${petId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "חיית המחמד לא נמצאה.");
    });

    it("should return 400 if pet_id is not a number", async () => {
      const petId = "invalid_id";
      const res = await request(app).get(`/records/get-records/${petId}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "חסר מידע אודות חיית המחמד.");
    });

    it("should return 404 if pet is not found", async () => {
      const petId = 9999; // Ensure this pet ID does not exist in your test database
      const res = await request(app).get(`/records/get-records/${petId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "חיית המחמד לא נמצאה.");
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await pool.end();
  });
});
