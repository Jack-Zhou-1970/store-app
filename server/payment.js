const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const bodyParser = require("body-parser");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
/*const app = express();*/
const router_pay = express.Router();
const { resolve } = require("path");

router_pay.use(bodyParser.json()); // process json

//the function used get customer infomation
//input:customer id

var customerid = ""; //for test use

//get from db
function getCustomerInfo(id) {
  return {
    customerId: customerid,
    address: "",
    email: "njzhch@163.com",
    name: "",
    phone: "",
    shipping: "",
  };
}

let getProductDetails = () => {
  return { currency: "CAD", amount: 9900 };
};

router_pay.get("/product-details", (req, res) => {
  let data = getProductDetails();
  res.json(data);
});

/////////////////////////////////////used to get the card last 4 digit
router_pay.get("/last4/:id", async (req, res) => {
  var cardLast4 = "";

  var customerInfo = getCustomerInfo(req.params);

  if (customerInfo.customerId != "") {
    //get paymentmethod id for client use
    var paymentMethods = await stripe.paymentMethods.list({
      customer: customerInfo.customerId,
      type: "card",
    });

    cardLast4 = paymentMethods.data[0].card.last4;
  }

  res.json({ last4: cardLast4 });
});

router_pay.get("/public-key", (req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

///////////////used to get payment status from client/////////////

router_pay.post("/payment-status", async (req, res) => {
  var data = req.body;
  console.log(data);
  if (data.status == "success") {
    //for test use , storage
    customerid = data.customerId;
  } else {
    console.log("payment fail");
  }

  res.json({ status: data.status });
});

/////////////////////This is normal pay////////////////////////////////////////////////
router_pay.post("/create-payment-intent", async (req, res) => {
  const productDetails = getProductDetails();

  const paymentIntentData = {
    amount: productDetails.amount,
    currency: productDetails.currency,
  };

  const customer = await stripe.customers.create();
  paymentIntentData.customer = customer.id;
  console.log(customer.id);

  paymentIntentData.setup_future_usage = "off_session";

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});
////////////////////////////////This is direct pay"//////////////////////////////////////
router_pay.post("/direct-pay", async (req, res) => {
  const productDetails = getProductDetails();

  const paymentIntentData = {
    amount: productDetails.amount,
    currency: productDetails.currency,
  };

  //get customerId from db
  var Id = getCustomerInfo("1234").customerId;
  console.log(Id);

  //get paymentMethodsId
  var paymentMethods = await stripe.paymentMethods.list({
    customer: Id,
    type: "card",
  });

  var paymentMethodsId = paymentMethods.data[0].id;

  paymentIntentData.customer = Id;
  paymentIntentData.payment_method = paymentMethodsId;

  //we use to confirm it without client request
  paymentIntentData.confirm = "true";

  paymentIntentData.setup_future_usage = "off_session";

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});

/////////////////////////////////////// Webhook handler for asynchronous events.
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
      console.log("💰 Payment received successed!");
    }

    if (eventType === "payment_intent.payment_failed") {
      // Notify the customer that their order was not fulfilled
      console.log("❌ Payment failed.");
    }

    res.sendStatus(200);
  }
);

module.exports = router_pay;
