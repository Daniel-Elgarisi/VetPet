const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");

describe("Medical Tests Results API Integration Tests", () => {
  describe("GET /medicalTestsResults/get-medical-tests-results/:pet_id", () => {
    it("should return status 200 OK and medical test results for a valid pet ID", async () => {
      const petId = 2; // Ensure this pet ID exists and has medical test results in your test database
      const res = await request(app).get(
        `/medicalTestsResults/get-medical-tests-results/${petId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 404 Not Found if no medical test results exist", async () => {
      const petId = 9999; // Ensure this pet ID does not exist in your test database
      const res = await request(app).get(
        `/medicalTestsResults/get-medical-tests-results/${petId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "לא נמצאו תוצאות בדיקות לחיית המחמד הנתונה"
      );
    });

    it("should return 400 Bad Request for an invalid pet ID", async () => {
      const invalidPetId = "invalid_id";
      const res = await request(app).get(
        `/medicalTestsResults/get-medical-tests-results/${invalidPetId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "המזהה של חיית המחמד חייב להיות מספר"
      );
    });
  });

  describe("GET /medicalTestsResults/get-test-result-details/:table_name/:test_id", () => {
    it("should return status 200 OK and test result details for a valid test ID and table name", async () => {
      const testId = 1; // Ensure this test ID exists in the table
      const tableName = "complete_blood_count_results"; // Use a valid table name
      const res = await request(app).get(
        `/medicalTestsResults/get-test-result-details/${tableName}/${testId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Object);
    });

    it("should return 404 Not Found if no test result exists", async () => {
      const testId = 9999; // Ensure this test ID does not exist in the table
      const tableName = "complete_blood_count_results"; // Use a valid table name
      const res = await request(app).get(
        `/medicalTestsResults/get-test-result-details/${tableName}/${testId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "לא נמצאה תוצאת הבדיקה הנתונה"
      );
    });

    it("should return 400 Bad Request for an invalid test ID", async () => {
      const invalidTestId = "invalid_id";
      const tableName = "complete_blood_count_results"; // Use a valid table name
      const res = await request(app).get(
        `/medicalTestsResults/get-test-result-details/${tableName}/${invalidTestId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "המזהה של תוצאת בדיקה חייב להיות מספר"
      );
    });

    it("should return 400 Bad Request for an invalid table name", async () => {
      const testId = 1; // Use a valid test ID
      const invalidTableName = "invalid_table";
      const res = await request(app).get(
        `/medicalTestsResults/get-test-result-details/${invalidTableName}/${testId}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "לא קיימת טבלת תוצאות מסוג זה במערכת"
      );
    });
  });

  describe("GET /medicalTestsResults/get-blood-test-findings-info/:test_type/:pet_gender/:pet_type", () => {
    it("should return status 200 OK and blood test findings info for valid parameters", async () => {
      const testType = "complete_blood_count_results"; // Ensure this test type exists in your test database
      const petGender = encodeURIComponent("זכר");
      const petType = encodeURIComponent("כלב");
      const res = await request(app).get(
        `/medicalTestsResults/get-blood-test-findings-info/${testType}/${petGender}/${petType}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 404 Not Found if no blood test findings info exists", async () => {
      const testType = "invalid_test"; // Ensure this test type does not exist
      const petGender = encodeURIComponent("male");
      const petType = encodeURIComponent("dog");
      const res = await request(app).get(
        `/medicalTestsResults/get-blood-test-findings-info/${testType}/${petGender}/${petType}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty(
        "message",
        "לא נמצא מידע עבור ממצאי בדיקה"
      );
    });

    it("should return 400 Bad Request if parameters are missing", async () => {
      const testType = "complete_blood_count_results"; // Use valid parameters
      const petGender = encodeURIComponent("זכר");
      const res = await request(app).get(
        `/medicalTestsResults/get-blood-test-findings-info/${testType}/${petGender}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "חסרים פרמטרים למציאת מידע עבור ממצאי בדיקה"
      );
    });

    it("should return 400 Bad Request if parameters are not strings", async () => {
      const testType = 123;
      const petGender = encodeURIComponent("זכר");
      const petType = encodeURIComponent("כלב");
      const res = await request(app).get(
        `/medicalTestsResults/get-blood-test-findings-info/${testType}/${petGender}/${petType}`
      );

      console.log("Response:", res.body);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "הפרמטרים למציאת מידע עבור ממצאי בדיקה חייבים להיות מסוג מחרוזת"
      );
    });
  });

  afterAll(async () => {
    console.log("Closing server and pool...");
    if (server) {
      server.close();
    }
    await pool.end();
    console.log("Server and pool closed.");
  });
});
