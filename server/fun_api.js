var async = require("async");

const testData = require("./public_data");

const db_api = require("./db_api");

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

    var mainPrice = await db_api.getPriceFromCode(
      "mainProduct",
      productMainCode
    );

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

      jsonSmallProduct.ProductCode = productSmallCode;
      jsonSmallProduct.ProductName =
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

  var totalAmount = mainProductPrice + smallProductPrice;

  return [totalAmount, priceMainProduct];
}

module.exports = {
  calPrice: calPrice /*this function is used to process price,return price info with json*/,
};
