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
