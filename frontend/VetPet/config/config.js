const localNetworkIP = "192.168.0.134";
// const localNetworkIP = "192.168.1.148";
const serverPort = "5000";
const baseURL = `http://${localNetworkIP}:${serverPort}`;
const wsURL = `ws://${localNetworkIP}:${serverPort}`;
export const config = { baseURL, wsURL };
