const {
  getTotalNotificationsCount,
} = require("../controllers/notificationsCountController");

const {
  getVaccinesNotifications,
} = require("../controllers/vaccineController");
const {
  getFutureAppointmentsForOwnerInNext3Days,
} = require("../controllers/appointmentsController");
const {
  getPetsByOwnerId,
  getFullPetInformation,
  getSubscriptionPetsByOwnerId,
} = require("../controllers/petsController");

jest.mock("../controllers/vaccineController");
jest.mock("../controllers/appointmentsController");
jest.mock("../controllers/petsController");

describe("Notifications Count API Integration Tests", () => {
  let req, res, mockSend, mockStatus;

  beforeEach(() => {
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockSend });
    res = { status: mockStatus };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /notificationsCount/get-total-notifications-count/:id", () => {
    it("should return status 200 OK and total notifications count for a valid owner ID", async () => {
      req = { params: { id: 4 } };

      getPetsByOwnerId.mockImplementationOnce((req, res) => {
        res.status(200).json([{ id: 2, name: "Buddy" }]);
      });
      getFutureAppointmentsForOwnerInNext3Days.mockImplementationOnce(
        (req, res) => {
          res.status(200).json([{ appointment: "Future Appointment" }]);
        }
      );
      getSubscriptionPetsByOwnerId.mockImplementationOnce((req, res) => {
        res.status(200).json([{ subscription: "Pet Subscription" }]);
      });
      getFullPetInformation.mockImplementationOnce((req, res) => {
        res.status(200).json([{ pet_type: "כלב" }]);
      });
      getVaccinesNotifications.mockImplementationOnce((req, res) => {
        res.status(200).json([{ notification: "Vaccine Notification" }]);
      });

      await getTotalNotificationsCount(req, res);

      console.log("mockStatus calls:", mockStatus.mock.calls);
      console.log("mockSend calls:", mockSend.mock.calls);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockSend).toHaveBeenCalledWith({ count: 3 });
    });

    it("should return 404 Not Found if no owner exists", async () => {
      req = { params: { id: 9999 } };

      getPetsByOwnerId.mockImplementationOnce((req, res) => {
        res.status(404).json({ message: "Not Found" });
      });

      await getTotalNotificationsCount(req, res);

      console.log("mockStatus calls:", mockStatus.mock.calls);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });
});
