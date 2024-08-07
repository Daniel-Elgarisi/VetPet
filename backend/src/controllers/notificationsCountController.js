const { getVaccinesNotifications } = require("./vaccineController");
const {
  getFutureAppointmentsForOwnerInNext3Days,
} = require("./appointmentsController");
const {
  getPetsByOwnerId,
  getFullPetInformation,
  getSubscriptionPetsByOwnerId,
} = require("./petsController");

const getTotalNotificationsCount = async (req, res) => {
  try {
    const ownerId = parseInt(req.params.id, 10);

    /* istanbul ignore next */
    if (isNaN(ownerId)) {
      /* istanbul ignore next */
      return res.status(400).json({ message: "Owner ID must be a number." });
    }

    let petsResponse;
    const mockResPets = {
      status: (code) => ({
        json: (data) => {
          petsResponse = data;
        },
      }),
    };

    await getPetsByOwnerId(req, mockResPets);

    if (!Array.isArray(petsResponse) || petsResponse.length === 0) {
      return res.status(404).json({ message: "No pets found for this owner." });
    }

    let totalCount = 0;

    // Call the owner-level functions once
    const appointmentsCount =
      await getFutureAppointmentsCountForOwnerInNext3Days(ownerId);
    console.log("Appointments count:", appointmentsCount);
    const subscriptionCount = await getSubscriptionPetsCountByOwnerId(ownerId);
    console.log("Subscription pets count:", subscriptionCount);

    for (const pet of petsResponse) {
      req.params.pet_id = pet.id;

      // Get full pet information
      let fullPetInfoResponse;
      const mockResFullPet = {
        status: (code) => ({
          json: (data) => {
            fullPetInfoResponse = data;
          },
        }),
      };
      await getFullPetInformation(req, mockResFullPet);

      /* istanbul ignore next */
      if (
        Array.isArray(fullPetInfoResponse) &&
        fullPetInfoResponse.length > 0
      ) {
        const petType = fullPetInfoResponse[0].pet_type;

        const vaccinesCount = await getVaccinesNotificationsCount(
          ownerId,
          pet.id,
          petType
        );
        console.log("Vaccines count for pet", pet.id, ":", vaccinesCount);
        totalCount += vaccinesCount;
      }
    }

    totalCount += appointmentsCount + subscriptionCount;

    console.log("Total notifications count:", totalCount);
    res.status(200).json({ count: totalCount });
  } catch (error) {
    /* istanbul ignore next */
    console.error("Error aggregating notifications count:", error);
    /* istanbul ignore next */
    res.status(500).json({
      message: "Error aggregating notifications count.",
    });
  }
};

const handleCountResponse = async (req, handlerFunction) => {
  let jsonResponse;
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        jsonResponse = data;
      },
    }),
  };

  await handlerFunction(req, mockRes);

  /* istanbul ignore next */
  return Array.isArray(jsonResponse) ? jsonResponse.length : 0;
};

const getVaccinesNotificationsCount = async (ownerId, petId, petType) => {
  const req = {
    params: { owner_id: ownerId, pet_id: petId, pet_type: petType },
  };
  return await handleCountResponse(req, getVaccinesNotifications);
};

const getFutureAppointmentsCountForOwnerInNext3Days = async (ownerId) => {
  const req = { params: { id: ownerId } };
  return await handleCountResponse(
    req,
    getFutureAppointmentsForOwnerInNext3Days
  );
};

const getSubscriptionPetsCountByOwnerId = async (ownerId) => {
  const req = { params: { id: ownerId } };
  let subscriptionPetsCount;
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        subscriptionPetsCount = data.length;
      },
    }),
  };
  await getSubscriptionPetsByOwnerId(req, mockRes);
  return subscriptionPetsCount;
};

module.exports = {
  getVaccinesNotificationsCount,
  getFutureAppointmentsCountForOwnerInNext3Days,
  getSubscriptionPetsCountByOwnerId,
  getTotalNotificationsCount,
};
