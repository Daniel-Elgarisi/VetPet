const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

let clientId = process.env.PAYPAL_CLIENT_ID;
let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

const environment = new checkoutNodeJssdk.core.SandboxEnvironment(
  clientId,
  clientSecret
);
const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

module.exports = { client };
