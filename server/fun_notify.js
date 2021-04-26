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
  const intent = await payment.stripe.paymentIntents.capture(payinstent, {
    amount_to_capture: amount,
  });

  return intent.status;
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
    result[0].orderStatus != "success"
  ) {
    returnValue.content = "captureNoNeed";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  if (result[0].orderStatus == "success") {
    await db_api.updateOrderStatus_2(orderNumber, new Date(), "readyPickup");
    returnValue.content = "captureSuccess";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "success";
    return returnValue;
  }

  if (result[0].paymentInstend == "" || result[0].paymentInstend == null) {
    returnValue.content = "captureCanNot";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  var result1 = await captureMoney(
    result[0].paymentInstend,
    result[0].totalAmount
  );

  if (result1 != "succeeded") {
    returnValue.content = "captureFail";
    returnValue.orderNumber = orderNumber;
    returnValue.status = "fail";
    return returnValue;
  }

  await db_api.updateOrderStatus_2(orderNumber, new Date(), "readyPickup");

  returnValue.content = "captureSuccess";
  returnValue.orderNumber = orderNumber;
  returnValue.status = "success";
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

module.exports = {
  getOrderInfoByShopCode: getOrderInfoByShopCode, ////the function below used to notify shop
  get_order_byShop: get_order_byShop,
  processCapture: processCapture,
  processPickUp: processPickUp,
  get_order_by_orderNumber: get_order_by_orderNumber,
  get_order_by_orderNumberQuery: get_order_by_orderNumberQuery,
  get_order_by_DateQuery: get_order_by_DateQuery,
  get_product_amountQuery: get_product_amountQuery,
};
