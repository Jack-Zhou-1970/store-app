//for test

//The payment detail send from client before payment is complete
export const paymentDetails = {
  //from client
  userCode: "T11111111111",
  email: "",
  address: "",
  city: "",
  province: "",
  country: "",
  postalCode: "",

  firstName: "",
  lastName: "",
  product: [
    {
      mainProductName: "珍珠奶茶",
      amount: 1,
      smallProduct: [
        { productName: "中尺寸", amount: 1 },
        { productName: "草莓", amount: 2 },
      ],
    },

    {
      mainProductName: "卡布奇诺咖啡",
      amount: 2,
      smallProduct: [{ productName: "大尺寸", amount: 1 }],
    },
  ],

  otherFee: 200,

  shopAddress: "174 MKCEE",
  shipFun: "pickup",
  rdyPickupTime: 0,
  paymentMethod: "card",
  paymentInstendId: "",
};

//used to upload user register info to server
export const userInfo = {
  userCode: "000004",
  email: "njzhch@163.com",
  password: "123456",
  phone: "4372315656",
  address: "72 cottonwood ct",
  shopAddress: "downtown",
  city: "thornhill",
  postalCode: "L3T 5X1",
  country: "canada",
  province: "ON",
  firstName: "xiaoming",
  lastName: "he",
  status: "success",
};

//the data is sent to server by client when it is open the app,and server will send back to clent with userCode

export const loginInfo = {
  userCode: "",
  email: "njzhch@166.com",
  password: "123456",
  shopAddress: "",
  allShopAddress: [],
  firstName: "",
  lastName: "",
  status: "fail",
};
