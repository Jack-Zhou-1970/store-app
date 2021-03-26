const sqlQuery = require("./db");

var async = require("async");

function dbToJson(db_result) {
  var json_obj = Object.values(JSON.parse(JSON.stringify(db_result)));
  return json_obj;
}

//get userCode from email
async function getUserCode(email) {
  var result = await sqlQuery(
    "select userCode from user_table where email = ?;",
    [email]
  );

  return dbToJson(result);
}

//insert register info from clent to user_table
async function insertRegister(
  userCode,
  email,
  password,
  phone,
  firstName,
  lastName,
  postalCode,
  pickupShop
) {
  var result = await sqlQuery(
    "insert into user_table (userCode,email,password,phone,firstName,lastName,postalCode,pickupShop) values(?,?,?,?,?,?,?,?)",
    [
      userCode,
      email,
      password,
      phone,
      firstName,
      lastName,
      postalCode,
      pickupShop,
    ]
  );

  return dbToJson(result);
}

//get product list

const queryProduct =
  "select f.className,a.productName_c as productName_main ,a.productIntro_c,a.picFileName,a.price as price_main,b.productName_c as productName_middle, c.productName_c as productName_small,c.price as price_small from (product_big_table a,product_middle_table b,product_small_table c,product_class_table f) inner join product_shop_table d on a.productCode=d.productCode and d.shopCode=? inner join product_ralation_table e on a.productCode= e.mainProductCode and b.productCode = e.midProductCode and c.productCode = e.smallProductCode and f.mainProductCode = e.mainProductCode;";

async function getProductList(shopCode) {
  var result = await sqlQuery(queryProduct, [shopCode]);
  return dbToJson(result);
}

//insert address and name info after payment complete,
async function insertAddressName_sql(
  address,
  city,
  province,
  country,
  postalCode,
  firstName,
  lastName,
  customerId,
  userCode
) {
  var result = await sqlQuery(
    "update user_table set address=?,city=?,province=?,country=?,postalCode=?,firstName=?,lastName=?,customerId=? where userCode = ? ",
    [
      address,
      city,
      province,
      country,
      postalCode,
      firstName,
      lastName,
      customerId,
      userCode,
    ]
  );

  return dbToJson(result);
}

async function insertAddressName(input_obj) {
  var result = await insertAddressName_sql(
    input_obj.address,
    input_obj.city,
    input_obj.province,
    input_obj.country,
    input_obj.postalCode,
    input_obj.firstName,
    input_obj.lastName,
    input_obj.customerId,
    input_obj.userCode
  );
  return result;
}

//The function below used to insert order info after payment success

async function insertOrderTable(
  orderNumber,
  userCode,
  tax,
  shipping,
  otherFee,
  paymentMethod,
  paymentTime,

  totalAmount,
  shopCode,
  orderStatus,
  shipFun,
  rdyPickupTime
) {
  var result = await sqlQuery(
    "insert into order_table ( orderNumber,userCode,tax,shipping,otherFee,paymentMethod,paymentTime,totalAmount,shopCode,orderStatus,shipFun,rdyPickupTime) values(?,?,?,?,?,?,?,?,?,?,?,?)",

    [
      orderNumber,
      userCode,
      tax,
      shipping,
      otherFee,
      paymentMethod,
      paymentTime,

      totalAmount,
      shopCode,
      orderStatus,
      shipFun,
      rdyPickupTime,
    ]
  );

  return dbToJson(result);
}

async function insertOrderProductTable(
  orderNumber,
  mainProductCode,
  mainProductNumber,
  smallProductCode,
  smallProductNumber
) {
  var result = await sqlQuery(
    "insert into order_product_table(orderNumber,mainProductCode, mainProductNumber,smallProductCode,smallProductNumber) values(?,?,?,?,?)",
    [
      orderNumber,
      mainProductCode,
      mainProductNumber,
      smallProductCode,
      smallProductNumber,
    ]
  );

  return dbToJson(result);
}

async function insertOrderAfterPayment(orderDetails_obj) {
  await insertOrderTable(
    orderDetails_obj.orderNumber,
    orderDetails_obj.userCode,
    orderDetails_obj.tax,
    orderDetails_obj.shipping,
    orderDetails_obj.otherFee,
    orderDetails_obj.paymentMethod,
    orderDetails_obj.paymentTime,
    orderDetails_obj.totalAmount,
    orderDetails_obj.shopCode,
    orderDetails_obj.orderStatus,
    orderDetails_obj.shipFun,
    orderDetails_obj.rdyPickupTime
  );

  for (var i = 0; i < orderDetails_obj.product.length; i++) {
    for (var j = 0; j < orderDetails_obj.product[i].smallProduct.length; j++) {
      await insertOrderProductTable(
        orderDetails_obj.orderNumber,
        orderDetails_obj.product[i].mainProductCode,
        orderDetails_obj.product[i].amount,
        orderDetails_obj.product[i].smallProduct[j].productCode,
        orderDetails_obj.product[i].smallProduct[j].amount
      );
    }
  }
}

//get product code from product name

async function getProductCodeFromName(productType, productName) {
  var result;

  switch (productType) {
    case "mainProduct":
      result = await sqlQuery(
        "select productCode from product_big_table where productName_c = ?  ",
        [productName]
      );
      break;

    case "middleProduct":
      result = await sqlQuery(
        "select productCode from product_middle_table where productName_c = ?  ",
        [productName]
      );
      break;

    case "smallProduct":
      result = await sqlQuery(
        "select productCode from product_small_table where productName_c = ?  ",
        [productName]
      );
      break;

    default:
      result = "";
      break;
  }

  return dbToJson(result)[0].productCode;
}

//get price from productCode

async function getPriceFromCode(productType, productCode) {
  var result;

  switch (productType) {
    case "mainProduct":
      result = await sqlQuery(
        "select price from product_big_table where productCode = ?  ",
        [productCode]
      );
      break;

    case "smallProduct":
      result = await sqlQuery(
        "select price from product_small_table where productCode = ?  ",
        [productCode]
      );
      break;

    default:
      result = "";
      break;
  }

  return dbToJson(result)[0].price;
}

//find price and amount in promotion table according productCode
async function getPriceAmountFromPromotion(mainProductCode, dateNow) {
  var result = await sqlQuery(
    "select price,amount from promotion_table where mainProductCode = ? and (?>beginTime)and(?<endTime)",
    [mainProductCode, dateNow, dateNow]
  );

  return dbToJson(result);
}

//find taxRate fro userCode
async function getTaxRateFromUserCode(userCode) {
  var result = await sqlQuery(
    "select tax from shop_table a inner join user_table b on b.userCode = ? and b.pickupShop = a.shopCode ",
    [userCode]
  );

  return dbToJson(result);
}

//Get other from order_table accordding orderNumber;
async function getOtherFeeFromOrderNumber(orderNumber) {
  var result = await sqlQuery(
    "select otherFee from order_table where orderNumber = ?",
    [orderNumber]
  );

  return dbToJson(result);
}

//Get userInfo from userCode;
async function getUserInfoFromUserCode(userCode) {
  //first get info from user_table
  var result1 = await sqlQuery(
    "select email,firstName,lastName,pickupShop from user_table where userCode =?",
    [userCode]
  );

  result1 = dbToJson(result1);

  //get shop address from pickupShop

  var result2 = await sqlQuery(
    "select address from shop_table where shopCode =?",
    [result1[0].pickupShop]
  );

  result1[0].shopAddress = dbToJson(result2)[0].address;

  return result1;
}

async function getShopCodeFromAddress(address) {
  result = await sqlQuery("select shopCode from shop_table where address = ?", [
    address,
  ]);

  return dbToJson(result)[0].shopCode;
}

module.exports = {
  insertRegister: insertRegister, //insert register info from clent to user_table
  getProductList: getProductList, //get product list
  insertAddressName: insertAddressName, //insert address and name info after payment complete,
  insertOrderAfterPayment: insertOrderAfterPayment, //// insert order info after payment success
  getProductCodeFromName: getProductCodeFromName, //get product code from product name
  getPriceFromCode: getPriceFromCode, ////get price from peoductCode
  getPriceAmountFromPromotion: getPriceAmountFromPromotion, //find price and amount in promotion table according productCode
  getTaxRateFromUserCode: getTaxRateFromUserCode, //find taxRate fro userCode
  getOtherFeeFromOrderNumber: getOtherFeeFromOrderNumber, //Get other from order_table accordding orderNumber;
  getUserInfoFromUserCode: getUserInfoFromUserCode, //Get userInfo from userCode
  getShopCodeFromAddress: getShopCodeFromAddress, //get shopCode from shop address
};
