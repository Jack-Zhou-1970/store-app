var async = require("async");

const db_api = require("./db_api");

const fun_api = require("./fun_api");

const payment = require("./payment");

//the function below used to notify shop
async function getOrderInfoByShopCode(inputObj) {
  var order_db = await db_api.getOrderInfoByShop(inputObj.shopCode);
  if (order_db.length == 0) return [];

  return fun_api.createOrderInfo(order_db);
}

function get_order_byShop(orderInfo) {
  var result = new Object();
  result.content = "addInfo";
  result.status = "requireCapture";

  result.orderInfo = orderInfo;

  return result;
}

async function get_order_by_orderNumber(inputObj) {
  var order_db = await db_api.getOrderInfoByOrderNumber(inputObj.orderNumber);
  if (order_db.length != 0) {
    order_db = fun_api.createOrderInfo(order_db);
  } else {
    order_db = [];
  }

  var result = new Object();
  result.content = "orderInfo";
  result.status = "requireCapture";

  result.orderInfo = order_db;

  return result;
}

async function get_order_by_orderNumberQuery(inputObj) {
  var order_db = await db_api.getOrderInfoByOrderNumberQuery(
    inputObj.orderNumber
  );

  if (order_db.length != 0) {
    order_db = fun_api.createOrderInfo(order_db);
  } else {
    order_db = [];
  }

  return order_db;
}

async function get_order_by_DateQuery(inputObj) {
  var order_db = await db_api.getOrderInfoByDate(
    inputObj.start_date,
    inputObj.end_date
  );

  if (order_db.length != 0) {
    order_db = fun_api.createOrderInfo(order_db);
  } else {
    order_db = [];
  }

  return order_db;
}

async function get_product_amountQuery(inputObj) {
  var product_db = await db_api.getProductAmountByDate(
    inputObj.start_date,
    inputObj.end_date
  );

  return product_db;
}

async function captureMoney(payinstent, amount) {
  var intent;
  try {
    intent = await payment.stripe.paymentIntents.capture(payinstent, {
      amount_to_capture: amount,
    });
  } catch (err) {
    intent = new Object();
    intent.status = "fail";
    console.log(err);
  }

  return intent.status;
}

async function refundMoney(payinstent, amount) {
  var intent;
  try {
    intent = await payment.stripe.refunds.create({
      amount: Math.round(amount),
      payment_intent: payinstent,
    });
  } catch (err) {
    intent = new Object();
    intent.status = "fail";
    console.log(err);
  }

  return intent.status;
}

async function cancelMoney(payinstent) {
  try {
    await payment.stripe.paymentIntents.cancel(payinstent);
  } catch (err) {
    console.log(err);
  }
}

//update reward info to db after payment complete
async function updateRewardToDBAfterCancel(orderNumber) {
  var result = await db_api.getRewardInfo(orderNumber);
  if (result[0].reward_out == undefined) {
    result[0].reward_out = 0;
  }

  if (result[0].userCode.charAt(0) == "T") {
    return { reward: 0, status: "success" };
  }

  if (result[0].reward_in == undefined) {
    result[0].reward_in = 0;
  }

  var result1 = await db_api.getUserInfoFromUserCode(result[0].userCode);

  if (result1[0].reward == undefined) {
    result1[0].reward = 0;
  }

  var reward = result1[0].reward + result[0].reward_out - result[0].reward_in;
  if (reward < 0) {
    reward = 0;
  }

  await db_api.updateRewardInfo(reward, result[0].userCode);

  return { reward: reward, status: "success" };
}

//update RewardInfo from email
async function updateRewardInfoByEmail(inputObj) {
  var result = await db_api.updateRewardInfoByEmail_DB(
    inputObj.reward,
    inputObj.email
  );
  return result;
}

async function processRefundCancel(inputObj) {
  var orderNumber = inputObj.orderNumber;
  var amount = inputObj.amount;

  var returnValue = new Object();

  var result = await db_api.getOrderStatusByOrderNumber(orderNumber);

  if (result.length == 0) {
    returnValue.content = "refundCancelNotFind";
    returnValue.orderNumber = orderNumber;

    returnValue.status = "fail";
    return returnValue;
  }

  if (
    result[0].orderStatus == "readyPayment" ||
    result[0].orderStatus == "success" ||
    result[0].orderStatus == "refund" ||
    result[0].orderStatus == "cancel"
  ) {
    returnValue.content = "refundCancelNoNeed";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  if (result[0].orderStatus == "afterPayment") {
    //just cancel
    await db_api.updateOrderStatus_2(orderNumber, new Date(), "cancel");

    await updateRewardToDBAfterCancel(orderNumber);

    returnValue.content = "cancelSuccess";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "success";
    return returnValue;
  }

  if (result[0].paymentInstend == "" || result[0].paymentInstend == null) {
    await db_api.updateOrderStatus_2(orderNumber, new Date(), "cancel");

    await updateRewardToDBAfterCancel(orderNumber);

    returnValue.content = "refundCancelCanNot";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "success";
    return returnValue;
  }

  /* if (result[0].orderStatus == "requireCapture") {
    await cancelMoney(result[0].paymentInstend);

    await db_api.updateOrderStatus_2(orderNumber, new Date(), "cancel");

    await updateRewardToDBAfterCancel(orderNumber);

    returnValue.content = "cancelSuccess";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "success";
    return returnValue;
  } else {
    var result1 = await refundMoney(result[0].paymentInstend, amount);

    if (result1 != "succeeded") {
      returnValue.content = "refundFail";
      returnValue.orderNumber = orderNumber;
      returnValue.status = "fail";
      return returnValue;
    }

    await updateRewardToDBAfterCancel(orderNumber);

    await db_api.updateOrderStatus_4(orderNumber, amount, new Date(), "refund");

    returnValue.content = "refundSuccess";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "success";
    return returnValue;
  }*/

  //no need to cancel
  var result1 = await refundMoney(result[0].paymentInstend, amount);

  if (result1 != "succeeded") {
    returnValue.content = "refundFail";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  await updateRewardToDBAfterCancel(orderNumber);

  await db_api.updateOrderStatus_4(orderNumber, amount, new Date(), "refund");

  returnValue.content = "refundSuccess";
  returnValue.orderNumber = orderNumber;
  returnValue.status = "success";
  return returnValue;
}

async function processCapture(orderNumber) {
  var returnValue = new Object();

  var result = await db_api.getOrderStatusByOrderNumber(orderNumber);

  if (result.length == 0) {
    returnValue.content = "captureNotFind";
    returnValue.orderNumber = orderNumber;

    returnValue.status = "fail";
    return returnValue;
  }

  if (
    result[0].orderStatus != "requireCapture" &&
    result[0].orderStatus != "success" &&
    result[0].orderStatus != "afterPayment"
  ) {
    returnValue.content = "captureNoNeed";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  var email = "";
  var result2 = await db_api.getEmailByOrderNumber(orderNumber);

  if (result2.length != 0) {
    email = result2[0].email;
  }

  if (
    result[0].orderStatus == "success" ||
    result[0].orderStatus == "afterPayment"
  ) {
    await db_api.updateOrderStatus_2(orderNumber, new Date(), "readyPickup");
    if (result[0].orderStatus == "success") {
      returnValue.content = "captureSuccess";
    } else {
      returnValue.content = "captureSuccess_NP"; //no payment
    }
    returnValue.orderNumber = orderNumber;
    returnValue.status = "success";
    if (email != "") {
      fun_api.sentEmailAfterAccept(orderNumber, email);
    }
    return returnValue;
  }

  if (result[0].paymentInstend == "" || result[0].paymentInstend == null) {
    returnValue.content = "captureCanNot";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  //now no need to captureMoney then skip

  /*var result1 = await captureMoney(
    result[0].paymentInstend,
    result[0].totalAmount
  );

  if (result1 != "succeeded") {
    returnValue.content = "captureFail";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }*/

  await db_api.updateOrderStatus_2(orderNumber, new Date(), "readyPickup");

  returnValue.content = "captureSuccess";
  returnValue.orderNumber = orderNumber;
  returnValue.status = "success";
  if (email != "") {
    fun_api.sentEmailAfterAccept(orderNumber, email);
  }
  return returnValue;
}

async function processPickUp(orderNumber) {
  var returnValue = new Object();

  var result = await db_api.getOrderStatusByOrderNumber(orderNumber);

  if (result.length == 0) {
    returnValue.content = "pickUpNotFind";
    returnValue.orderNumber = orderNumber;

    returnValue.status = "fail";
    return returnValue;
  }

  if (result[0].orderStatus != "readyPickup") {
    returnValue.content = "pickUpNoNeed";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  await db_api.updateOrderStatus_3(orderNumber, new Date(), "complete");

  returnValue.content = "pickUpSuccess";
  returnValue.orderNumber = orderNumber;
  returnValue.status = "success";
  return returnValue;
}

//refund and cancel money

//get userInfo by orderNumber query
async function getUserInfoByOrderNumberQuery(input_obj) {
  var result = await db_api.getUserInfoByOrderNumber(input_obj.orderNumber);
  return result;
}

module.exports = {
  getOrderInfoByShopCode: getOrderInfoByShopCode, ////the function below used to notify shop
  get_order_byShop: get_order_byShop,
  processCapture: processCapture,
  processPickUp: processPickUp,
  get_order_by_orderNumber: get_order_by_orderNumber,
  get_order_by_orderNumberQuery: get_order_by_orderNumberQuery,
  get_order_by_DateQuery: get_order_by_DateQuery,
  get_product_amountQuery: get_product_amountQuery,
  processRefundCancel: processRefundCancel,
  getUserInfoByOrderNumberQuery: getUserInfoByOrderNumberQuery,
  updateRewardInfoByEmail: updateRewardInfoByEmail,
};
