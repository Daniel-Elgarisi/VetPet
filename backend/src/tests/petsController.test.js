const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("Pets API Integration Tests", () => {
  describe("GET /pets/get-pets/:id", () => {
    it("should return 400 Bad Request for invalid owner ID", async () => {
      const res = await request(app).get("/pets/get-pets/not-a-number");
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("meesage");
    });

    it("should return 404 Not Found for a non-existent owner ID", async () => {
      const res = await request(app).get("/pets/get-pets/9999");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /pets/get-fullPetInformation/:pet_id", () => {
    it("should return 400 Bad Request for invalid pet ID", async () => {
      const res = await request(app).get(
        "/pets/get-fullPetInformation/not-a-number"
      );
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 404 Not Found for a non-existent pet ID", async () => {
      const res = await request(app).get("/pets/get-fullPetInformation/9999");
      expect(res.statusCode).toBe(404);
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await pool.end();
  });
});
