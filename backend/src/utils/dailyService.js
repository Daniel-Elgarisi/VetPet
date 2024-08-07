const axios = require("axios");
require("dotenv").config();

const DAILY_API_BASE_URL = "https://api.daily.co/v1";
const DAILY_API_KEY = process.env.DAILY_API_KEY;

const createDailyRoom = async () => {
  try {
    const response = await axios.post(
      `${DAILY_API_BASE_URL}/rooms`,
      {
        properties: {
          enable_chat: true,
          exp: Math.round(Date.now() / 1000) + 60 * 60 * 24,
          geo: "eu-central-1",
          autojoin: true,
          enable_prejoin_ui: false,
          enable_knocking: false,
          enable_screenshare: false,
        },
      },
      { headers: { Authorization: `Bearer ${DAILY_API_KEY}` } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating Daily room:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const listMeetings = async () => {
  try {
    const response = await axios.get(`${DAILY_API_BASE_URL}/meetings`, {
      headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      "Error listing meetings:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const getParticipantCountBySessionId = async (roomName) => {
  try {
    const meetings = await listMeetings();
    const meeting = meetings.find((m) => m.room === roomName);
    // console.log(meeting.max_participants);
    return meeting.max_participants || 0;
  } catch (error) {
    console.error("Error getting session ID:", error);
    throw error;
  }
};

module.exports = { createDailyRoom, getParticipantCountBySessionId };
