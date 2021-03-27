//get userCode from email
getUserCode("njzhch@gmail.com")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

//insert register info from clent to user_table
insertRegister(
  "000003",
  "njlymlym@gmail.com",
  "7654321",
  "13851784417",
  "li",
  "he",
  "L4T 5X2",
  "400002"
)
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

//get product list

getProductList("400002")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

//insert address and name info after payment complete,
insertAddressName(testData.orderDetails);

////The function below used to insert order info after payment success
function insertOrder() {
  console.log("begin to insert");

  var mydate = new Date();
  console.log(mydate);

  testData.orderDetails.rdyPickupTime = mydate;
  testData.orderDetails.paymentTime = mydate;

  insertOrderAfterPayment(testData.orderDetails);
  console.log("complete insert");
}

insertOrder();

//get product code from product name

db_api
  .getProductCodeFromName("mainProduct", "卡布奇诺咖啡")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

db_api
  .getProductCodeFromName("middleProduct", "尺寸")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

db_api
  .getProductCodeFromName("smallProduct", "草莓")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

//get price from productCode
db_api
  .getPriceFromCode("mainProduct", "100001")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

db_api
  .getPriceFromCode("smallProduct", "300003")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

//this function is used to process price,return price info with json*/
fun_api.calPrice(testData.paymentDetails).then((result) => {
  console.log(result);
  console.log("begin to print small product");
  for (var i = 0; i < result[0].length; i++) {
    console.log(result[0][i].smallProduct);
    console.log("////////////////////////////");
  }
});

//find price and amount in promotion table according productCode
var date = new Date();

db_api
  .getPriceAmountFromPromotion("100001", date)
  .then((result) => console.log(result));

//find taxRate fro userCode
db_api.getTaxRateFromUserCode("000003").then((result) => console.log(result));

//Get userInfo from userCode;
db_api
  .getUserInfoFromUserCode("000003")
  .then((result) => console.log(result))
  .catch((e) => console.log(e));

//get bill information this info is used to senrd to send to client and diaplay to the user to confirrm
fun_api.billInfoToClient(testData.paymentDetails).then((result) => {
  console.log(result);
});

//this is direct-pay,direct-pay only to store order info  no need to store user_table
date = new Date();

testData.paymentComplete.pickupTime = date;

fun_api.storeDbAfterDirectPay(testData.paymentComplete);

//this is card pay
date = new Date();

testData.paymentComplete.pickupTime = date;

fun_api.storeDbAfterCardPay(testData.paymentComplete);

//insert resgister info to dB

fun_api
  .insertRegisterInfo(testData.userInfo)
  .then((result) => console.log(result));

//get user code and other info from password and email
fun_api.getUserCode(testData.loginInfo).then((result) => console.log(result));
