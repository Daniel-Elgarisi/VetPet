const request = require("supertest");
const { app, server } = require("../server");
const pool = require("../config/db");
const moment = require("moment-timezone");

describe("Appointments API Integration Tests", () => {
  describe("POST /appointments/update-appointment/:pet_id", () => {
    // it("should update an appointment successfully if valid data is provided", async () => {
    //   const pet_id = 2;
    //   const updateData = {
    //     previousDate: "2024-04-20",
    //     previousTime: "11:00",
    //     previousAppointmentType: "בדיקה שגרתית",
    //     date: "2024-04-20",
    //     time: "12:00",
    //     appointmentType: "בדיקה שגרתית",
    //   };
    //   const response = await request(app)
    //     .post(`/appointments/update-appointment/${pet_id}`)
    //     .send(updateData);
    //   expect(response.statusCode).toBe(200);
    //   expect(response.body).toHaveProperty("message", "התור עודכן בהצלחה.");
    //   expect(response.body).toHaveProperty("appointment");
    //   expect(response.body.appointment).toHaveProperty("id");
    //   expect(response.body.appointment.date).toBe(
    //     moment
    //       .tz(
    //         `${updateData.date} ${updateData.time}`,
    //         "DD-MM-YYYY HH:mm",
    //         "Asia/Jerusalem"
    //       )
    //       .toISOString()
    //   );
    //   expect(response.body.appointment.appointment_type).toBe(
    //     updateData.appointmentType
    //   );
    // });
  });

  describe("GET /appointments/get-previousAppointmentsForOwner/:id", () => {
    it("should return 200 OK and previous appointments for a valid owner ID", async () => {
      // Assume ownerId 1 exists and has previous appointments
      const ownerId = 4;
      const res = await request(app).get(
        `/appointments/get-previousAppointmentsForOwner/${ownerId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it("should return 404 Not Found if no previous appointments exist", async () => {
      const ownerId = 9999;
      const res = await request(app).get(
        `/appointments/get-previousAppointmentsForOwner/${ownerId}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "לא נמצאו פגישות קודמות.");
    });
  });

  describe("GET /appointments/get-futureAppointmentsForOwner/:id", () => {
    it("should return 200 OK and future appointments for a valid owner ID", async () => {
      const ownerId = 4;
      const res = await request(app).get(
        `/appointments/get-futureAppointmentsForOwner/${ownerId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it("should return 404 Not Found if no future appointments exist", async () => {
      const ownerId = 9999;
      const res = await request(app).get(
        `/appointments/get-futureAppointmentsForOwner/${ownerId}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "לא נמצאו פגישות עתידיות.");
    });
  });

  describe("GET /appointments/get-previousAppointments/:pet_id", () => {
    it("should return 200 OK and previous appointments for a valid pet ID", async () => {
      const petId = 2;
      const res = await request(app).get(
        `/appointments/get-previousAppointments/${petId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it("should return 404 Not Found if no previous appointments exist", async () => {
      const petId = 9999;
      const res = await request(app).get(
        `/appointments/get-previousAppointments/${petId}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "לא נמצאו פגישות קודמות.");
    });
  });

  describe("GET /appointments/get-futureAppointments/:pet_id", () => {
    it("should return 200 OK and future appointments for a valid pet ID", async () => {
      const petId = 4;
      const res = await request(app).get(
        `/appointments/get-futureAppointments/${petId}`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });

    it("should return 404 Not Found if no future appointments exist", async () => {
      const petId = 9999;
      const res = await request(app).get(
        `/appointments/get-futureAppointments/${petId}`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "לא נמצאו פגישות עתידיות.");
    });
  });

  describe("GET /appointments/get-AppointmentTypes", () => {
    it("should return a list of appointment types", async () => {
      const res = await request(app).get("/appointments/get-AppointmentTypes");

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });

  describe("GET /appointments/get-NonAvailableAppointmentsForDay/:date", () => {
    it("should return fully booked time slots for a given day", async () => {
      const date = "20-04-2020";
      const res = await request(app).get(
        `/appointments/get-NonAvailableAppointmentsForDay/${date}`
      );

      expect(res.statusCode).toBe(200);
      if (res.body.fullyBookedTimeSlots) {
        expect(res.body).toHaveProperty("fullyBookedTimeSlots");
        expect(res.body.fullyBookedTimeSlots).toBeInstanceOf(Array);
      } else {
        expect(res.body).toHaveProperty(
          "message",
          "אין פגישות בתפוסה מלאה ליום זה."
        );
      }
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    await pool.end();
  });
});
