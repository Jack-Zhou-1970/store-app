const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const bodyParser = require("body-parser");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
/*const app = express();*/
const router_pay = express.Router();
const { resolve } = require("path");

router_pay.get("/public-key", (req, res) => {
  console.log(process.env.STRIPE_PUBLISHABLE_KEY);

  res.json({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });

  console.log("send public key ok");
});

router_pay.get("/product-details", (req, res) => {
  let data = getProductDetails();
  res.json(data);
  console.log("send produc-details ok");
});

router_pay.post("/create-payment-intent", async (req, res) => {
  const body = req.body;
  const productDetails = getProductDetails();

  const options = {
    ...body,
    amount: productDetails.amount,
    currency: productDetails.currency,
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(options);
    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});

let getProductDetails = () => {
  return { currency: "EUR", amount: 9900 };
};

// Webhook handler for asynchronous events.
router_pay.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️ Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
      // Fulfill any orders, e-mail receipts, etc
      console.log("💰 Payment received!");
    }

    if (eventType === "payment_intent.payment_failed") {
      // Notify the customer that their order was not fulfilled
      console.log("❌ Payment failed.");
    }

    res.sendStatus(200);
  }
);

module.exports = router_pay;
