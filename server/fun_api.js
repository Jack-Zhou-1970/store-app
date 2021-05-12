var async = require("async");

const NodeRSA = require("node-rsa");

const prv_key =
  "MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEAxuHz0jnMVsov9qiXxDPlpORadw5UuLTDG200S3zNDE6NgaTdx45MyLN5FCbuSif3wZ1DWJyJJFuHs9nwrD8+RQIDAQABAkAYDX+lbyQNYwqF9EHWksg1NwDR4UPRytrF2GE4t/E8iZTFdthEazAebAJU1EpAMVH1yCk64NZoauHJqDM71pnBAiEA9LVydtUbXESrnuhvxBhh3yBwT5aNiXl94uN6UbrLQXkCIQDQDzJpKsut3RtFkcJvO8zfv4hTMxoh7Z4z0MLxbtecLQIgU79pbive0kQaLCdGYOkrTa6PYV2YEO2IXMcXTLNN7pkCIFhpbMmF1wFtyK36b34nEjsuP7bjK0Kpn6VzG7POny6NAiA1jQPTepR2HDXdS4sAO25ryB4ST9n4kXzotK3EIOrdgA==";

const db_api = require("./db_api");
const { json } = require("body-parser");
const { getUserCodeFromEmail, getUserCodeFromEmail_1 } = require("./db_api");

const fs = require("fs");

const mailSend = require("./email");

let emailOptions = {
  from: '"chun"<467466257@qq.com>',
  to: "njzhch@163.com",
  subject: "Wellcome world-tea",
  text: "Thank you to register word-tea ,verified code is ",
};

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

//this function is used to cal reward
function calReward(reward_price, reward_amount, reward_number) {
  function findMaxIndex(array) {
    max = 0;
    for (var i = 0; i < array.length; i++) {
      if (array[i] > array[max]) {
        max = i;
      }
    }
    return max;
  }

  if (reward_number == undefined || reward_number == "") {
    reward_number = 0;
  }

  var reward_result = new Object();

  //first cal how much many can dec
  var totalMoney = 0;

  var cupNumber = Math.floor(reward_number / 100); //reward 100 = 1 cup

  var cupNumber_s = cupNumber;

  while (cupNumber > 0 && reward_amount.length > 0) {
    var index = findMaxIndex(reward_price);
    if (reward_amount[index] >= cupNumber) {
      totalMoney = totalMoney + cupNumber * reward_price[index];
      reward_amount[index] = reward_amount[index] - cupNumber;
      cupNumber = 0;
      break;
    } else {
      totalMoney = totalMoney + reward_amount[index] * reward_price[index];
      cupNumber = cupNumber - reward_amount[index];
      reward_amount.splice(index, 1);
      reward_price.splice(index, 1);
    }
  }

  var reward_out = (cupNumber_s - cupNumber) * 100;

  //next cal how many reward can get

  var amount_remain = 0;

  if (reward_amount.length > 0) {
    for (var i = 0; i < reward_amount.length; i++) {
      amount_remain = amount_remain + reward_amount[i];
    }
  }

  var reward_in = amount_remain * 10; //1cup = get 10 point

  reward_result.totalMoney = totalMoney;

  if (reward_number >= 100) {
    reward_result.reward_out = reward_out;
  } else {
    reward_result.reward_out = 0;
  }

  reward_result.reward_in = reward_in;

  return reward_result;
}

//this function is used to process price,return price info with json.   input: payment detail from client

async function calPrice(paymentDetails_obj) {
  var priceMainProduct = [];
  var priceSmallProduct = [];

  var totalPrice = 0;
  var smallProductPrice = 0;

  var reward_price = [];
  var reward_amount = [];

  var reward;

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

    jsonMainProduct.totalPrice =
      (jsonMainProduct.price + smallProductPrice) * jsonMainProduct.amount;
    totalPrice = totalPrice + jsonMainProduct.totalPrice;

    reward_price.push(jsonMainProduct.price + smallProductPrice);
    reward_amount.push(jsonMainProduct.amount);

    jsonMainProduct.smallProduct = priceSmallProduct;
    priceMainProduct.push(jsonMainProduct);

    priceSmallProduct = [];
    smallProductPrice = 0;
  }

  if (paymentDetails_obj.userCode.charAt(0) == "C") {
    reward_result = calReward(
      reward_price,
      reward_amount,
      paymentDetails_obj.reward_out
    );
  } else {
    reward_result = new Object();
    reward_result.reward_in = 0;
    reward_result.reward_out = 0;
    reward_result.totalMoney = 0;
  }

  var totalAmountBeforeTax = totalPrice;

  var taxRate = await db_api.getTaxRateFromUserCode(
    paymentDetails_obj.userCode
  );

  var taxRates;

  if (taxRate.length == 0) {
    taxRates = 0.13;
  } else {
    taxRates = taxRate[0].tax;
  }
  var tax = (totalAmountBeforeTax - reward_result.totalMoney) * taxRates;

  var shipFee = calShipFee(paymentDetails_obj.userCode);
  var otherFee = paymentDetails_obj.otherFee;

  var totalAmountAfterTax =
    totalAmountBeforeTax - reward_result.totalMoney + tax + shipFee + otherFee;

  totalAmountAfterTax = Math.round(totalAmountAfterTax);

  jsonTotal = new Object();

  jsonTotal.totalPriceBeforeTax = totalAmountBeforeTax;
  jsonTotal.reward_in = reward_result.reward_in;
  jsonTotal.reward_out = reward_result.reward_out;
  jsonTotal.reward_totalMoney = reward_result.totalMoney;

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
  /*if (paymentComplete_obj.TotalPrice.totalPriceAfterTax == 0) {
    return;
  }*/
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

  //add reward info
  orderDetails.reward_in = paymentComplete_obj.TotalPrice.reward_in;
  orderDetails.reward_out = paymentComplete_obj.TotalPrice.reward_out;

  await db_api.insertOrderAfterPayment(orderDetails);

  //insert dB for guest
  if (paymentComplete_obj.userCode.charAt(0) == "T") {
    var result = await db_api.getUserInfoFromUserCode(
      paymentComplete_obj.userCode
    );
    if (result.length == 0) {
      var address = await getAllShopAdd();
      var shopCode = await db_api.getShopCodeFromAddress(address[0]);
      await db_api.insertRegister(
        paymentComplete_obj.userCode,
        "",
        "",
        "",
        "customer",
        shopCode,
        "",
        new Date(),
        "success"
      );
    }
  }
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

  if (result.length > 0 && result[0].status == "success") {
    userInfo_obj.status = "fail";
    userInfo_obj.userCode = gerCode("tempUserCode");
    return userInfo_obj;
  }

  if (result.length > 0 && result[0].status == "pendding") {
    //delete

    await db_api.deleteFromEmail(userInfo_obj.email);
  }

  //ger a userCode
  var userCode = gerCode("userCode");
  var verifyCode = getRandomNum(10000, 99999).toString();
  var verifyTime = new Date();
  var status = "pendding";

  var pickupShop = await db_api.getShopCodeFromAddress(
    userInfo_obj.shopAddress
  );

  result = await db_api.insertRegister(
    userCode,
    userInfo_obj.email,
    userInfo_obj.password,
    userInfo_obj.phone,
    userInfo_obj.nickName,
    pickupShop,
    verifyCode,
    verifyTime,
    status
  );

  //success
  userInfo_obj.userCode = userCode;
  userInfo_obj.verifyCode = verifyCode;
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

function judgePassword(password1, password2) {
  if (password1 == password2) {
    return false;
  }

  if (password1 == false || password2 == false) {
    return false;
  }

  var prikey = new NodeRSA(prv_key, "pkcs8-private");
  prikey.setOptions({ encryptionScheme: "pkcs1" });

  var result1 = prikey.decrypt(password1, "utf8");
  var result2 = prikey.decrypt(password2, "utf8");

  if (result1 == false || result2 == false) {
    return false;
  }

  if (result1 == result2) {
    return true;
  } else {
    return false;
  }
}

//get userCode and other info from email and password  and send to client
async function getUserCode(userInfo_obj) {
  var result = await db_api.getUserCodeFromEmail_1(userInfo_obj.email);

  if (result.length > 0) {
    var result1 = judgePassword(userInfo_obj.password, result[0].password);
  } else {
    result1 = false;
  }

  if (result1 == false) {
    userInfo_obj.userCode = gerCode("tempUserCode");
    userInfo_obj.nickName = "customer";

    userInfo_obj.phone = "";
    userInfo_obj.email = "";
    userInfo_obj.allShopAddress = await getAllShopAdd();
    userInfo_obj.shopAddress = userInfo_obj.allShopAddress[0];
    userInfo_obj.last4 = "";
    userInfo_obj.reward = 0;
    userInfo_obj.status = "fail";
    return userInfo_obj;
  } else {
    userInfo_obj.userCode = result[0].userCode;
    userInfo_obj.nickName = result[0].nickName;
    userInfo_obj.phone = result[0].phone;
    userInfo_obj.reward = result[0].reward;

    var result1 = await db_api.getShopAddressFromShopCode(result[0].pickupShop);
    if (result1.length > 0) {
      userInfo_obj.shopAddress = result1[0].address;
    }
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
    if (
      result[0].orderStatus == "requireCapture" ||
      result[0].orderStatus == "success"
    ) {
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

//the function is used to process user register
async function processRegister(input_obj) {
  var result = await insertRegisterInfo(input_obj);

  if (result.status == "fail") {
    return result;
  } else {
    //send email

    htmlEamilSent1(result.email, result.verifyCode);

    result.verifyCode = "";
    return result;
  }
}

//The  function used to verify the code
async function processVerifyCode(input_obj) {
  input_obj.status = "fail";

  var result = await db_api.getVerifyCodeFromEmail(input_obj.email);

  if (result.length == 0) {
    return input_obj;
  }

  if (result[0].verifyCode == input_obj.verifyCode) {
    await db_api.updateStatusFromEmail(input_obj.email, "success");
    var result1 = await getUserCode(input_obj);
    result1.status = "success";

    return result1;
  } else {
    //delete
    await db_api.deleteFromEmail(input_obj.email);
    return input_obj;
  }
}

function findCatalog(inputObject) {
  return inputObject.catalogName == this.className;
}

function findProduct(inputObject) {
  return inputObject.mainProductName == this.productName_main;
}

function findProductMiddle(inputObject) {
  return inputObject.middleProductName == this.productName_middle;
}
function findProductSmall(inputObject) {
  return inputObject.smallProductName == this.productName_small;
}

//Get productList from ShopAddress
async function getProductListFromShopCode(shopAddress) {
  //first get shopcode from shopaddress
  var shopCode = await db_api.getShopCodeFromAddress(shopAddress);
  if (shopCode == "") {
    return null;
  }

  var product_db = await db_api.getProductList(shopCode);

  var productList = [];

  for (var i = 0; i < product_db.length; i++) {
    //judge if catalog is exist
    var index = -1;
    index = productList.findIndex(findCatalog, product_db[i]);
    if (index == -1) {
      //insert we dind not find catalog ,insert catalog ,product,productMiddle,and productSmall
      var productList_o = new Object();
      productList_o.catalogName = product_db[i].className;
      productList_o.product = [];
      var product_o = new Object();
      product_o.mainProductName = product_db[i].productName_main;
      product_o.productIntro = product_db[i].productIntro_c;
      product_o.price = product_db[i].price_main;
      product_o.picFileName = product_db[i].picFileName;
      product_o.productMiddle = [];
      var productMiddle_o = new Object();
      productMiddle_o.middleProductName = product_db[i].productName_middle;
      productMiddle_o.productSmall = [];
      var productSmall_o = new Object();
      productSmall_o.smallProductName = product_db[i].productName_small;
      productSmall_o.smallPrice = product_db[i].price_small;
      //begin to push
      productMiddle_o.productSmall.push(productSmall_o);
      product_o.productMiddle.push(productMiddle_o);
      productList_o.product.push(product_o);
      productList.push(productList_o);
      continue;
    }
    //product calaog find,let us check product

    var index2 = -1;
    index2 = productList[index].product.findIndex(findProduct, product_db[i]);
    if (index2 == -1) {
      //insert
      //catalog find,but we can not find product ,so we need to insert product to this catalog
      product_o = new Object();
      product_o.mainProductName = product_db[i].productName_main;
      product_o.productIntro = product_db[i].productIntro_c;
      product_o.price = product_db[i].price_main;
      product_o.picFileName = product_db[i].picFileName;
      product_o.productMiddle = [];
      productMiddle_o = new Object();
      productMiddle_o.middleProductName = product_db[i].productName_middle;
      productMiddle_o.productSmall = [];
      productSmall_o = new Object();
      productSmall_o.smallProductName = product_db[i].productName_small;
      productSmall_o.smallPrice = product_db[i].price_small;
      //begin to push
      productMiddle_o.productSmall.push(productSmall_o);
      product_o.productMiddle.push(productMiddle_o);
      productList[index].product.push(product_o);
      continue;
    }

    //product catalog and product find,let us check productMiddle
    var index3 = -1;
    index3 = productList[index].product[index2].productMiddle.findIndex(
      findProductMiddle,
      product_db[i]
    );
    if (index3 == -1) {
      //catalog and product find,but we can not find productMiddle ,so we need to insert productMiddle to this product
      productMiddle_o = new Object();
      productMiddle_o.middleProductName = product_db[i].productName_middle;
      productMiddle_o.productSmall = [];
      productSmall_o = new Object();
      productSmall_o.smallProductName = product_db[i].productName_small;
      productSmall_o.smallPrice = product_db[i].price_small;
      //begin to push
      productMiddle_o.productSmall.push(productSmall_o);
      productList[index].product[index2].productMiddle.push(productMiddle_o);
      continue;
    }

    //product catalog , product,productmiddle find,let us check productsmall
    var index4 = -1;
    index4 = productList[index].product[index2].productMiddle[
      index3
    ].productSmall.findIndex(findProductSmall, product_db[i]);
    if (index4 == -1) {
      //we find catalog ,product and productMiddle ,but we can not find productsmall ,so we need to insert productsmall to product middle
      productSmall_o = new Object();
      productSmall_o.smallProductName = product_db[i].productName_small;
      productSmall_o.smallPrice = product_db[i].price_small;
      //begin to push
      productList[index].product[index2].productMiddle[
        index3
      ].productSmall.push(productSmall_o);
      continue;
    }
  }

  return productList;
}

//delete UnpaymentRecord by order number
async function deleteUnPaymentList(input_obj) {
  await db_api.deleteUnpaymentRecord(input_obj.orderNumber);
  return { status: "success" };
}

//get orderInfo from userCode
async function getOrderInfoFromUserCode(userCode) {
  var result = await db_api.getOrderInfo(userCode);

  return result;
}

function findOrderNumber(inputObject) {
  return inputObject.orderNumber == this.orderNumber;
}

function findProduct_1(inputObject) {
  return (
    inputObject.mainProductName == this.productName_main &&
    inputObject.smallIndex == this.smallIndex
  );
}

function findSmallIndex(inputObject) {
  return inputObject.smallIndex == this.smallIndex;
}

function createOrderInfo(order_db) {
  var orderList = [];

  for (var i = 0; i < order_db.length; i++) {
    var index1 = -1;

    index1 = orderList.findIndex(findOrderNumber, order_db[i]);
    if (index1 == -1) {
      //not find order number insert ordernumber,product,productsmall

      var orderList_o = new Object();
      orderList_o.orderNumber = order_db[i].orderNumber;
      orderList_o.totalPrice = order_db[i].totalAmount;
      orderList_o.paymentTime = order_db[i].paymentTime;
      orderList_o.status = order_db[i].orderStatus;

      var product_o = new Object();
      product_o.smallIndex = order_db[i].smallIndex;
      product_o.mainProductName = order_db[i].productName_main;
      product_o.amount = order_db[i].mainProductNumber;

      productSmall_o = new Object();
      productSmall_o.smallProductName = order_db[i].productName_small;
      productSmall_o.amount = order_db[i].smallProductNumber;

      product_o.smallProduct = [];
      product_o.smallProduct.push(productSmall_o);

      orderList_o.product = [];
      orderList_o.product.push(product_o);

      orderList.push(orderList_o);

      continue;
    }

    //find order number,now check product but must use smallIndex

    var index2 = -1;
    index2 = orderList[index1].product.findIndex(findProduct_1, order_db[i]);

    if (index2 == -1) {
      //not find product ,insert product,small product

      var product_o = new Object();
      product_o.smallIndex = order_db[i].smallIndex;
      product_o.mainProductName = order_db[i].productName_main;
      product_o.amount = order_db[i].mainProductNumber;

      productSmall_o = new Object();
      productSmall_o.smallProductName = order_db[i].productName_small;
      productSmall_o.amount = order_db[i].smallProductNumber;

      product_o.smallProduct = [];
      product_o.smallProduct.push(productSmall_o);

      orderList[index1].product.push(product_o);
      continue;
    }

    //find ordernumber and product, now check small product
    var index3 = -1;
    index3 = orderList[index1].product[index2].smallProduct.findIndex(
      findProductSmall,
      order_db[i]
    );
    if (index3 == -1) {
      //not find small product just insert small product
      productSmall_o = new Object();
      productSmall_o.smallProductName = order_db[i].productName_small;
      productSmall_o.amount = order_db[i].smallProductNumber;
      orderList[index1].product[index2].smallProduct.push(productSmall_o);
      continue;
    }
  }

  return orderList;
}

async function getOrderListFromUserCode(inputObj) {
  var order_db = await getOrderInfoFromUserCode(inputObj.userCode);

  if (order_db.length == 0) return [];

  return createOrderInfo(order_db);
}

//update reward info to db after payment complete
async function updateRewardToDB(inputObj) {
  if (inputObj.userCode.charAt(0) == "T") {
    return { reward: 0, status: "success" };
  }

  var result = await db_api.getRewardInfo(inputObj.orderNumber);
  if (result[0].reward_out == undefined) {
    result[0].reward_out = 0;
  }

  if (result[0].reward_in == undefined) {
    result[0].reward_in = 0;
  }

  var result1 = await db_api.getUserCodeFromEmail_1(inputObj.email);

  if (result1[0].reward == undefined) {
    result1[0].reward = 0;
  }

  var reward = result1[0].reward - result[0].reward_out + result[0].reward_in;
  if (reward < 0) {
    reward = 0;
  }

  await db_api.updateRewardInfo(reward, inputObj.userCode);

  return { reward: reward, status: "success" };
}

//judge if can accept order
async function judgeAcceptOrder(inputObj) {
  var reqBack = new Object();

  var result = await db_api.getShopTime(inputObj.shopAddress);

  if (result.length == 0) {
    reqBack.status = "notOk";
    return reqBack;
  }

  var startTime = result[0].worktimeBegin_h * 60 + result[0].worktimeBegin_m;
  var endTime = result[0].worktimeEnd_h * 60 + result[0].worktimeEnd_m;

  var timeNow = new Date();

  var hour = timeNow.getHours();
  var minute = timeNow.getMinutes();
  var time = hour * 60 + minute;

  if (time < startTime || endTime - time < 30) {
    reqBack.status = "notOk";
    return reqBack;
  }

  //let get stock

  var result = await db_api.getProductStockByName(inputObj.mainProductName);

  if (result.length == 0) {
    reqBack.status = "ok";
    reqBack.stock = 0;
    return reqBack;
  } else {
    reqBack.status = "ok";
    reqBack.stock = result[0].stock;
    return reqBack;
  }
}

function htmlEamilSent(email, orderNumber) {
  const path = require("path");
  var root = path.resolve("worldtea.jpg");

  var htmlData = fs.readFileSync("email.html", "utf-8");
  result = htmlData.replace(/%orderNumber%/g, orderNumber);

  emailOptions.to = email;
  emailOptions.subject = "your order is ready";
  emailOptions.html = result;
  emailOptions.attachments = [
    {
      filename: "worldtea.jpg",
      path: root,
      cid: "00001",
    },
  ];

  mailSend.mailerSend(emailOptions);
}

function htmlEamilSent1(email, code) {
  const path = require("path");
  var root = path.resolve("worldtea.jpg");

  var htmlData = fs.readFileSync("email1.html", "utf-8");
  result = htmlData.replace(/%code%/g, code);

  emailOptions.to = email;
  emailOptions.subject = "verify code from world tea house";
  emailOptions.html = result;
  emailOptions.attachments = [
    {
      filename: "worldtea.jpg",
      path: root,
      cid: "00001",
    },
  ];

  mailSend.mailerSend(emailOptions);
}

function sentEmailAfterAccept(orderNumber, email) {
  htmlEamilSent(email, orderNumber);
}

async function processAmountSingleProduct(mainProductName, amount) {
  //get stock
  var result = await db_api.getProductStockByName(mainProductName);
  if (result.length == 0) {
    return;
  }

  if (result[0].stock != 99999) {
    var newStock = result[0].stock - amount;
    if (newStock <= 0) {
      newstock = 0;
    }
    //update
    await db_api.updateProductStockByName_DB(mainProductName, newStock);
  }
}

//update stock after payment
async function updateStock(paymentDetail) {
  for (var i = 0; i < paymentDetail.product.length; i++) {
    await processAmountSingleProduct(
      paymentDetail.product[i].mainProductName,
      paymentDetail.product[i].amount
    );
  }
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
  processRegister: processRegister, //the function is used to process user register
  processVerifyCode: processVerifyCode, //The  function used to verify the code
  getProductListFromShopCode: getProductListFromShopCode, //Get productList from ShopAddress
  deleteUnPaymentList: deleteUnPaymentList, //delete UnpaymentRecord by order number
  getOrderInfoFromUserCode: getOrderInfoFromUserCode, //get orderInfo from userCode
  getOrderListFromUserCode: getOrderListFromUserCode, ////get orderInfo from userCode
  updateRewardToDB: updateRewardToDB, //update reward info to db after payment complete
  createOrderInfo: createOrderInfo,
  judgeAcceptOrder: judgeAcceptOrder, ////judge if can accept order and get stock
  sentEmailAfterAccept: sentEmailAfterAccept,
  updateStock: updateStock, //after payment
};
