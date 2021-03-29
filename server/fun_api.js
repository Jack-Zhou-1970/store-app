var async = require("async");

const db_api = require("./db_api");
const { json } = require("body-parser");
const { getUserCodeFromEmail } = require("./db_api");

//the function used to random
function getRandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  return Min + Math.round(Rand * Range);
}

////ger code
function gerCode(type) {
  var firstLetter;
  switch (type) {
    case "orderNumber":
      firstLetter = "D";
      break;

    case "userCode":
      firstLetter = "C";
      break;

    case "tempUserCode":
      firstLetter = "T";
      break;

    default:
      firstLetter = "N";
      break;
  }

  var date = new Date();

  var year = date.getFullYear().toString();
  year = year.slice(2);

  var month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1).toString()
      : (date.getMonth() + 1).toString();

  var day =
    date.getDate() < 10
      ? "0" + date.getDate().toString()
      : date.getDate().toString();

  var random =
    firstLetter + year + month + day + getRandomNum(10000, 99999).toString();

  return random;
}

//the function used to calculate shipFee
function calShipFee(userCode) {
  return 0;
}

// the function used to calculate pickup time
function getPickupTime(userCode) {
  var date = new Date();
  return date;
}

//cal main product price ,accodding product_big_table and promotion table
async function calMainProductprice(mainProductCode) {
  var date = new Date();

  var result = await db_api.getPriceAmountFromPromotion(mainProductCode, date);

  if (result.length > 0) {
    return result[0].price;
  } else {
    var mainPrice = await db_api.getPriceFromCode(
      "mainProduct",
      mainProductCode
    );
    return mainPrice;
  }
}

//this function is used to process price,return price info with json.   input: payment detail from client

async function calPrice(paymentDetails_obj) {
  var priceMainProduct = [];
  var priceSmallProduct = [];

  var mainProductPrice = 0;
  var smallProductPrice = 0;

  for (var i = 0; i < paymentDetails_obj.product.length; i++) {
    var jsonMainProduct = new Object();

    var productMainCode = await db_api.getProductCodeFromName(
      "mainProduct",
      paymentDetails_obj.product[i].mainProductName
    );

    jsonMainProduct.mainProductCode = productMainCode;
    jsonMainProduct.mainProductName =
      paymentDetails_obj.product[i].mainProductName;

    var mainPrice = await calMainProductprice(productMainCode);

    if (mainPrice < 0.001) return [999999999, priceMainProduct];

    jsonMainProduct.price = mainPrice;
    jsonMainProduct.amount = paymentDetails_obj.product[i].amount;
    jsonMainProduct.totalPrice = jsonMainProduct.price * jsonMainProduct.amount;
    mainProductPrice = mainProductPrice + jsonMainProduct.totalPrice;

    for (
      var j = 0;
      j < paymentDetails_obj.product[i].smallProduct.length;
      j++
    ) {
      var jsonSmallProduct = new Object();

      var productSmallCode = await db_api.getProductCodeFromName(
        "smallProduct",
        paymentDetails_obj.product[i].smallProduct[j].productName
      );

      jsonSmallProduct.productCode = productSmallCode;
      jsonSmallProduct.productName =
        paymentDetails_obj.product[i].smallProduct[j].productName;

      var smallPrice = await db_api.getPriceFromCode(
        "smallProduct",
        productSmallCode
      );

      jsonSmallProduct.price = smallPrice;
      jsonSmallProduct.amount =
        paymentDetails_obj.product[i].smallProduct[j].amount;
      jsonSmallProduct.totalPrice = smallPrice * jsonSmallProduct.amount;
      smallProductPrice = smallProductPrice + jsonSmallProduct.totalPrice;

      priceSmallProduct.push(jsonSmallProduct);
    }

    jsonMainProduct.smallProduct = priceSmallProduct;
    priceSmallProduct = [];
    priceMainProduct.push(jsonMainProduct);
  }

  var totalAmountBeforeTax = mainProductPrice + smallProductPrice;

  var taxRate = await db_api.getTaxRateFromUserCode(
    paymentDetails_obj.userCode
  );

  var taxRates;

  if (taxRate.length == 0) {
    taxRates = 0.13;
  } else {
    taxRates = taxRate[0].tax;
  }
  var tax = totalAmountBeforeTax * taxRates;

  var shipFee = calShipFee(paymentDetails_obj.userCode);
  var otherFee = paymentDetails_obj.otherFee;

  var totalAmountAfterTax = totalAmountBeforeTax + tax + shipFee + otherFee;

  totalAmountAfterTax = Math.round(totalAmountAfterTax);

  jsonTotal = new Object();

  jsonTotal.totalPriceBeforeTax = totalAmountBeforeTax;
  jsonTotal.taxRate = taxRates;
  jsonTotal.tax = (tax * 100) / 100;
  jsonTotal.shipFee = shipFee;
  jsonTotal.otherFee = otherFee;
  jsonTotal.totalPriceAfterTax = totalAmountAfterTax;

  return [priceMainProduct, jsonTotal];
}

//get bill information,this info is used to send to client and diaplay to the user to confirrm

async function billInfoToClient(paymentDetails_obj) {
  var priceInfo = await calPrice(paymentDetails_obj);

  var jsonBillInfo = new Object();

  jsonBillInfo.subPrice = priceInfo[0];

  jsonBillInfo.TotalPrice = priceInfo[1];

  jsonBillInfo.orderNumber = gerCode("orderNumber");

  jsonBillInfo.userCode = paymentDetails_obj.userCode;

  jsonBillInfo.pickupTime = getPickupTime(paymentDetails_obj.userCode);

  jsonBillInfo.paymentMethod = paymentDetails_obj.paymentMethod;

  jsonBillInfo.shipFun = paymentDetails_obj.shipFun;

  jsonBillInfo.shopAddress = paymentDetails_obj.shopAddress;

  var userInfo = await db_api.getUserInfoFromUserCode(
    paymentDetails_obj.userCode
  );

  if (userInfo.length == 0) {
    return jsonBillInfo;
  }

  jsonBillInfo.email = userInfo[0].email;

  jsonBillInfo.firstName = userInfo[0].firstName;

  jsonBillInfo.lastName = userInfo[0].lastName;

  jsonBillInfo.shopAddress = userInfo[0].shopAddress;

  jsonBillInfo.last4 = await getLast4(paymentDetails_obj.userCode);

  jsonBillInfo.paymentInstendId = paymentDetails_obj.paymentInstendId;

  return jsonBillInfo;
}

//after payment success,begin to stroge data to dB

//this is direct-pay,direct-pay only to store order info  no need to store user_table

//order status
const RDY_PAYMENT = "readyPayment";
const REQ_CAP = "requireCapture";
const PAY_COMPLETE = "payComplete";
const RDY_PICK = "readyPickup";
const ALL_COMPLETE = "allComplete";

async function storeDbBeforePayment(paymentComplete_obj, status) {
  var orderDetails = new Object();

  orderDetails.orderNumber = paymentComplete_obj.orderNumber;
  orderDetails.userCode = paymentComplete_obj.userCode;
  orderDetails.tax = paymentComplete_obj.TotalPrice.tax;
  orderDetails.shipping = paymentComplete_obj.TotalPrice.shipFee;
  orderDetails.otherFee = paymentComplete_obj.TotalPrice.otherFee;
  orderDetails.paymentMethod = paymentComplete_obj.paymentMethod;
  var date = new Date();
  orderDetails.paymentTime = date;
  orderDetails.totalAmount = paymentComplete_obj.TotalPrice.totalPriceAfterTax;

  orderDetails.shopCode = await db_api.getShopCodeFromAddress(
    paymentComplete_obj.shopAddress
  );

  orderDetails.orderStatus = status;
  orderDetails.shipFun = paymentComplete_obj.shipFun;
  /* orderDetails.rdyPickupTime = paymentComplete_obj.pickupTime;*/
  orderDetails.rdyPickupTime = date; //this is for test,must modify
  orderDetails.product = paymentComplete_obj.subPrice;

  await db_api.insertOrderAfterPayment(orderDetails);
}

//this is card-pay, must store address info
async function storeDbAfterCardPay(paymentComplete_obj) {
  var userInfo = await db_api.getUserInfoFromUserCode(
    paymentComplete_obj.userCode
  );

  if (userInfo.length == 0) {
    return;
  }

  await db_api.insertAddressName(paymentComplete_obj);
}

//insert resgister info to dB

async function insertRegisterInfo(userInfo_obj) {
  //first judge if it is already register

  var result = await db_api.getUserCodeFromEmail(userInfo_obj.email);

  if (result.length > 0) {
    userInfo_obj.status = "fail";
    userInfo_obj.userCode = gerCode("tempUserCode");
    return userInfo_obj;
  }

  //ger a userCode
  userCode = gerCode("userCode");

  var pickupShop = await db_api.getShopCodeFromAddress(
    userInfo_obj.shopAddress
  );

  result = await db_api.insertRegister(
    userCode,
    userInfo_obj.email,
    userInfo_obj.password,
    userInfo_obj.phone,
    userInfo_obj.firstName,
    userInfo_obj.lastName,
    userInfo_obj.address,
    pickupShop
  );

  //success
  userInfo_obj.userCode = userCode;
  userInfo_obj.status = "success";

  return userInfo_obj;
}

//get all shop address

async function getAllShopAdd() {
  var arrShop = [];

  var result = await db_api.getAllShopAddress();

  for (var i = 0; i < result.length; i++) {
    arrShop.push(result[i].address);
  }

  return arrShop;
}

//get last4 from usercode

async function getLast4(userCode) {
  const payment = require("./payment");
  //first get customerId

  var result = await db_api.getCustomerIdFromUserCode(userCode);

  if (result[0].customerId == null) {
    return "";
  }

  var customerId = result[0].customerId;

  var paymentMethods = await payment.stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  var cardLast4 = paymentMethods.data[0].card.last4;
  return cardLast4;
}

//get userCode and other info from email and password  and send to client
async function getUserCode(userInfo_obj) {
  var result = await db_api.getUserCodeFromEmailPwd(
    userInfo_obj.email,
    userInfo_obj.password
  );
  if (result.length == 0) {
    userInfo_obj.userCode = gerCode("tempUserCode");
    userInfo_obj.lastName = "customer";
    userInfo_obj.firstName = "";
    userInfo_obj.address = "";
    userInfo_obj.phone = "";
    userInfo_obj.email = "";
    userInfo_obj.allShopAddress = await getAllShopAdd();
    userInfo_obj.shopAddress = userInfo_obj.allShopAddress[0];
    userInfo_obj.last4 = "";
    userInfo_obj.status = "fail";
    return userInfo_obj;
  } else {
    userInfo_obj.userCode = result[0].userCode;
    userInfo_obj.lastName = result[0].lastName;
    userInfo_obj.firstName = result[0].firstName;

    var result1 = await db_api.getShopAddressFromShopCode(result[0].pickupShop);
    userInfo_obj.shopAddress = result1[0].address;
    userInfo_obj.allShopAddress = await getAllShopAdd();
    var last4 = await getLast4(userInfo_obj.userCode);
    userInfo_obj.last4 = last4;
    userInfo_obj.status = "success";
    return userInfo_obj;
  }
}

//update paymenInstend when create payment complete
async function updatePaymentInstend(paymentDetails_obj, paymentInstend) {
  await db_api.UpdatePaymentInstend_db(
    paymentDetails_obj.orderNumber,
    paymentInstend
  );
}

//update orderStatus by orderNumber and paymentInstend when payment complete
async function updateOrderStatus(paymentDetails_obj, orderStatus) {
  await db_api.updateOrderStatus_db(
    paymentDetails_obj.orderNumber,
    paymentDetails_obj.paymentInstend,
    orderStatus
  );

  var result = await db_api.getOrderStatusByOrdetNumberInstend(
    paymentDetails_obj.orderNumber,
    paymentDetails_obj.paymentInstend
  );

  status = "fail";

  if (result.length > 0) {
    if (result[0].orderStatus == "requireCapture") {
      status = "success";
    }
  }

  return status;
}

//use only direct_pay complete
async function updateOrderStatusInstend(paymentDetails_obj, orderStatus) {
  var result = await db_api.updateOrderStatusInstend_db(
    paymentDetails_obj.orderNumber,
    paymentDetails_obj.paymentInstend,
    orderStatus
  );
}

module.exports = {
  calPrice: calPrice, //this function is used to process price,return price info with json
  billInfoToClient: billInfoToClient, //get bill information this info is used to senrd to send to client and diaplay to the user to confirrm
  getRandomNum: getRandomNum, //random a number
  gerCode: gerCode, //ger code
  storeDbBeforePayment: storeDbBeforePayment, //inerset order info from user to db before payment
  storeDbAfterCardPay: storeDbAfterCardPay, //this is card-pay, must store address info and customerId
  insertRegisterInfo: insertRegisterInfo, //insert resgister info  to dB
  getUserCode: getUserCode, //get userCode and other info from email and password  and send to client
  updatePaymentInstend: updatePaymentInstend, //update paymenInstend
  updateOrderStatus: updateOrderStatus, //update orderStatus by orderNumber and paymentInstend
  updateOrderStatusInstend: updateOrderStatusInstend, ////use only direct_pay complete
};
