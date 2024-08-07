const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");
const vetId = 1;

jest.mock("../config/db", () => ({
  query: jest.fn(),
  end: jest.fn(),
}));

describe("Vets API Integration Tests", () => {
  describe("POST /vets/edit-vetsProfile/:id", () => {
    it("should return 400 Bad Request for invalid vet ID", async () => {
      const res = await request(app)
        .post("/vets/edit-vetsProfile/not-a-number")
        .send({ email: "vet@example.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "חסר מידע אודות הוטרינר.");
    });

    it("should return 404 Not Found for a non-existent vet ID", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app)
        .post("/vets/edit-vetsProfile/9999")
        .send({ name: "Vet Name" });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("לא נמצא הוטרינר");
    });

    it("should return 200 OK and the updated vet for a valid vet ID", async () => {
      const updateData = {
        email: "vetupdated1@example.com",
      };

      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [updateData],
      });

      const res = await request(app)
        .post(`/vets/edit-vetsProfile/${vetId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Vet was updated");
      expect(res.body).toHaveProperty("vet");
      expect(res.body.vet).toMatchObject(updateData);
    });
  });

  describe("GET /vets/get-VetInformation/:id", () => {
    it("should return 400 Bad Request for missing vet ID", async () => {
      const res = await request(app).get("/vets/get-VetInformation/missing");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "חסר מידע אודות הוטרינר.");
    });

    it("should return status 400 Bad Request for invalid vet ID", async () => {
      const res = await request(app).get(
        "/vets/get-VetInformation/not-a-number"
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "חסר מידע אודות הוטרינר.");
    });

    it("should return 404 Not Found for a non-existent vet ID", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app).get("/vets/get-VetInformation/9999");

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("לא נמצא הוטרינר");
    });

    it("should return 200 OK and the vet details for a valid vet ID", async () => {
      const expectedDetails = {
        name: "ד״ר אליהו שחר",
        license: "123456",
        email: "beckyu96@gmail.com",
        phone_number: "0528287761",
      };

      pool.query.mockResolvedValueOnce({
        rowCount: 1,
        rows: [expectedDetails],
      });

      const res = await request(app).get(`/vets/get-VetInformation/${vetId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject(expectedDetails);
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  });
});
