const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("Vaccine API Integration Tests", () => {
  describe("GET /vaccines/get-vaccines/:pet_id/:dateofbirth", () => {
    it("should return status 200 OK and vaccines for a valid pet ID", async () => {
      const petId = 2; // Ensure this pet ID exists and has vaccines in your test database
      const dateOfBirth = "2021-07-01";
      const res = await request(app).get(
        `/vaccines/get-vaccines/${petId}/${dateOfBirth}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it("should return 404 Not Found if no vaccines exist", async () => {
      const petId = 9999; // Ensure this pet ID does not exist in your test database
      const dateOfBirth = "2021-01-01";
      const res = await request(app).get(
        `/vaccines/get-vaccines/${petId}/${dateOfBirth}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "לא נמצאו חיסונים לחיית המחמד הנתונה"
      );
    });
  });

  describe("GET /vaccines/get-vaccines-notifications/:pet_id/:pet_type", () => {
    it("should return status 200 OK and vaccines notifications for a valid pet ID", async () => {
      const petId = 2; // Ensure this pet ID exists and has vaccines in your test database
      const petType = encodeURIComponent("כלב");
      console.log("Pet type:", petType);
      const res = await request(app).get(
        `/vaccines/get-vaccines-notifications/${petId}/${petType}`
      );

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body) || res.body === null).toBe(true);
    });

    it("should return 404 Not Found if no vaccines notifications exist", async () => {
      const petId = 9999;
      const petType = encodeURIComponent("חתול"); // URI-encode the pet type
      const res = await request(app).get(
        `/vaccines/get-vaccines-notifications/${petId}/${petType}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "לא נמצאו חיסונים לחיית המחמד הנתונה"
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
