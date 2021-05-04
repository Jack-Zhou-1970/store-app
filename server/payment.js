const env = require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const bodyParser = require("body-parser");
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const fun_api = require("./fun_api");

const router_pay = express.Router();
const { resolve } = require("path");
const { UpdateOrderStatus } = require("./db_api");

const router_ws = require("./ws"); //for webSocket

router_pay.use(bodyParser.json()); // process json

router_pay.get("/public-key", (req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

//alipay
router_pay.post("/createIntent_alipay", async (req, res) => {
  const [priceMain, priceTotal] = await fun_api.calPrice(req.body);

  /* console.log("priceTotal");
  console.log(priceTotal.totalPriceAfterTax);*/

  const paymentIntentData = {
    payment_method_types: ["alipay"],
    amount: priceTotal.totalPriceAfterTax,
    currency: "CAD",
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    await fun_api.updatePaymentInstend(req.body, paymentIntent.id);

    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});

router_pay.post("/payComplete_alipay", async (req, res) => {
  var data = req.body;

  if (data.status == "success") {
    var result = await fun_api.updateOrderStatus(data, "success");

    if (result == "success") {
      var result1 = await fun_api.updateRewardToDB(data);

      await fun_api.updateStock(req.body);

      router_ws.ee.emit("paymentComplete", JSON.stringify(req.body));

      res.json({ reward: result1.reward, status: "success" });
    } else {
      console.log("!!!!!payment fail");
      res.json({ status: "fail" });
    }
  } else {
    console.log("payment fail");
    res.json({ status: "fail" });
  }
});

//wechat pay

router_pay.post("/weChatPay", async (req, res) => {
  const db_api = require("./db_api");

  const [priceMain, priceTotal] = await fun_api.calPrice(req.body);

  const charge = await stripe.charges.create({
    amount: priceTotal.totalPriceAfterTax,
    currency: "cad",
    source: req.body.source,
  });

  if (charge.status == "succeeded") {
    await db_api.updateOrderStatusNoIntend_db(req.body.orderNumber, "success");

    var result1 = await fun_api.updateRewardToDB(req.body);

    await fun_api.updateStock(req.body);

    router_ws.ee.emit("paymentComplete", JSON.stringify(req.body));

    res.json({ reward: result1.reward, status: "success" });
  } else {
    console.log("!!!!!payment fail");
    res.json({ status: "fail" });
  }
});

/////after payment process

router_pay.post("/afterPayment", async (req, res) => {
  const db_api = require("./db_api");

  await db_api.updateOrderStatusNoIntend_db(
    req.body.orderNumber,
    "afterPayment"
  );
  var result3 = await fun_api.updateRewardToDB(req.body);

  await fun_api.updateStock(req.body);

  router_ws.ee.emit("paymentComplete", JSON.stringify(req.body));

  res.json({ reward: result3.reward, status: "afterPayment" });
});

///////////////payment complete /////////////

router_pay.post("/paymentComplete", async (req, res) => {
  var data = req.body;

  if (data.status == "success") {
    var result = await fun_api.updateOrderStatus(data, "requireCapture");

    if (result == "success") {
      await fun_api.storeDbAfterCardPay(data);
      var result1 = await fun_api.updateRewardToDB(data);

      await fun_api.updateStock(req.body);

      router_ws.ee.emit("paymentComplete", JSON.stringify(req.body));

      res.json({ reward: result1.reward, status: "requireCapture" });
    } else {
      console.log("!!!!!payment fail");
      res.json({ status: "fail" });
    }
  } else {
    console.log("payment fail");
    res.json({ status: "fail" });
  }
});

/////////////////////This is normal pay////////////////////////////////////////////////
router_pay.post("/create-payment-intent", async (req, res) => {
  const [priceMain, priceTotal] = await fun_api.calPrice(req.body);

  /* console.log("priceTotal");
  console.log(priceTotal.totalPriceAfterTax);*/

  const paymentIntentData = {
    amount: priceTotal.totalPriceAfterTax,
    currency: "CAD",
    capture_method: "manual",
  };

  const customer = await stripe.customers.create();
  paymentIntentData.customer = customer.id;

  paymentIntentData.setup_future_usage = "off_session";

  try {
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    await fun_api.updatePaymentInstend(req.body, paymentIntent.id);

    res.json(paymentIntent);
  } catch (err) {
    res.json(err);
  }
});
////////////////////////////////This is direct pay"//////////////////////////////////////
router_pay.post("/direct-pay", async (req, res) => {
  /*console.log("before cal");*/
  const [priceMain, priceTotal] = await fun_api.calPrice(req.body);
  /*console.log("cal complete");*/

  const db_api = require("./db_api");

  if (priceTotal.totalPriceAfterTax < 0.01 && req.body.product.length > 0) {
    //all payment is pay by reward
    await db_api.updateOrderStatusNoIntend_db(req.body.orderNumber, "success");
    var result3 = await fun_api.updateRewardToDB(req.body);

    await fun_api.updateStock(req.body);

    router_ws.ee.emit("paymentComplete", JSON.stringify(req.body));

    res.json({ reward: result3.reward, status: "requireCapture" });
  } else {
    const paymentIntentData = {
      amount: priceTotal.totalPriceAfterTax,
      currency: "CAD",
      capture_method: "manual",
    };

    var result = await db_api.getCustomerIdFromUserCode(req.body.userCode);

    if (result[0].customerId == null) {
      res.json({ status: "fail" });
      return;
    }

    var customerId = result[0].customerId;

    //get paymentMethodsId
    try {
      var paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });
    } catch (err) {
      console.log(err);
    }

    try {
      var paymentMethodsId = paymentMethods.data[0].id;

      paymentIntentData.customer = customerId;
      paymentIntentData.payment_method = paymentMethodsId;

      //we use to confirm it without client request
      paymentIntentData.confirm = "true";

      paymentIntentData.setup_future_usage = "off_session";

      /*console.log("before paymentIntent");*/
    } catch (err) {
      console.log(err);
      console.log("paymentMethodsId err");
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create(
        paymentIntentData
      );

      /*console.log(paymentIntent);*/

      if (paymentIntent.status == "requires_capture") {
        req.body.paymentInstend = paymentIntent.id;

        /*console.log("before update");*/
        await fun_api.updateOrderStatusInstend(req.body, "requireCapture");
        /* console.log(" update1");*/
        var result2 = await fun_api.updateRewardToDB(req.body);
        /* console.log("update2");*/

        await fun_api.updateStock(req.body);

        router_ws.ee.emit("paymentComplete", JSON.stringify(req.body));

        res.json({ reward: result2.reward, status: "requireCapture" });
      } else {
        res.json({ status: "fail" });
      }
    } catch (err) {
      res.json({ status: "fail" });
    }
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
    console.log("webhook event");
    console.log(data);
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

module.exports = {
  router_pay: router_pay,
  stripe: stripe,
};
