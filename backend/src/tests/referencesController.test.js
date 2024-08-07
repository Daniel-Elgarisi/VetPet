const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("References API Integration Tests", () => {
  describe("GET /references/get-references/:pet_id", () => {
    it("should return status 200 OK and references for a valid pet ID", async () => {
      const petId = 2; // Ensure this pet ID exists and has references in your test database
      const res = await request(app).get(`/references/get-references/${petId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("pet");
      expect(res.body).toHaveProperty("references");
      expect(res.body.references).toBeInstanceOf(Array);
      if (res.body.references.length > 0) {
        expect(res.body.references[0]).toHaveProperty("reference_type");
        expect(res.body.references[0]).toHaveProperty("doctor_name");
      }
    });

    it("should return 404 Not Found if no references exist for the given pet", async () => {
      const petId = 4; // Ensure this pet ID exists but does not have any references in your test database
      const res = await request(app).get(`/references/get-references/${petId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "שגיאה בהחזרת הפניות לחיית המחמד: לא נמצאו הפניות עבור חיית המחמד הנתונה"
      );
    });

    it("should return 400 if pet_id is not a number", async () => {
      const petId = "invalid";
      const res = await request(app).get(`/references/get-references/${petId}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "המזהה של חיית המחמד חייב להיות מספר."
      );
    });

    it("should return 404 if pet is not found", async () => {
      const petId = 9999; // Ensure this pet ID does not exist in your test database
      const res = await request(app).get(`/references/get-references/${petId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "שגיאה בהחזרת הפניות לחיית המחמד: חיית המחמד לא נמצאה"
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
