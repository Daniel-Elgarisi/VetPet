const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");
const ownerId = 4;

describe("Owners API Integration Tests", () => {
  describe("POST /owners/edit-ownersProfile/:id", () => {
    it("should return 400 Bad Request for invalid owner ID", async () => {
      const res = await request(app)
        .post("/owners/edit-ownersProfile/not-a-number")
        .send({ email: "dsada@gmail.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "המזהה של הבעלים חייב להיות מספר."
      );
    });

    it("should return 404 Not Found for a non-existent owner ID", async () => {
      const res = await request(app)
        .post("/owners/edit-ownersProfile/9999")
        .send({ name: "Owner Name" });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("לא נמצא בעל חיית מחמד");
    });

    it("should return 200 OK and the updated owner for a valid owner ID", async () => {
      const updateData = {
        email: "beckyu96@gmail.com",
      };

      const res = await request(app)
        .post(`/owners/edit-ownersProfile/${ownerId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Owner was updated");
      expect(res.body).toHaveProperty("owner");
      expect(res.body.owner).toMatchObject(updateData);
    });
  });

  describe("GET /owners/get-ownerInformation/:id", () => {
    it("should return 404 Not Found for a non-existent owner ID", async () => {
      const res = await request(app).get(`/owners/get-ownerInformation/9999`);

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("לא נמצא בעל חיית מחמד");
    });

    it("should return 200 OK and the owner details for a valid owner ID", async () => {
      const res = await request(app).get(
        `/owners/get-ownerInformation/${ownerId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("name", "בקי אוזדנסקי");
      expect(res.body).toHaveProperty("identity_number", 123456789);
      expect(res.body).toHaveProperty("email", "beckyu96@gmail.com");
    });
  });

  describe("GET /owners/get-transactionsForOwner/:id", () => {
    it("should return 404 Not Found if no transactions exist for the given owner", async () => {
      const res = await request(app).get(
        `/owners/get-transactionsForOwner/9999`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "לא נמצאו עסקאות עבור בעל החיית מחמד."
      );
    });

    it("should return 200 OK and the transactions for a valid owner ID", async () => {
      const res = await request(app).get(
        `/owners/get-transactionsForOwner/${ownerId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  });
});
