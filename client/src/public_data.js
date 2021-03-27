//for test

//The payment detail send from client before payment is complete
export const paymentDetails = {
  //from client
  userCode: "C21032780577",
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

  shipFun: "pickup",
  rdyPickupTime: 0,
  paymentMethod: "card",
  paymentInstendId: "",
};

//The paymentComplete send from server  after payment is complete
export const paymentComplete = {
  userCode: "C21032780577",
  orderNumber: "D21032657999",
  email: "njlymlym@gmail.com",
  address: "99 cottonwood ct",
  city: "north york",
  postalCode: "L3E 53W",
  country: "canada",
  province: "ON",
  firstName: "li",
  lastName: "he",
  shopAddress: "174 MKCEE",
  pickupTime: 0,
  paymentMethod: "card",
  shipFun: "pickup",
  last4: "4242",
  subPrice: [
    {
      mainProductCode: "100001",
      mainProductName: "珍珠奶茶",
      price: 400,
      amount: 1,
      totalPrice: 400,
      smallProduct: [
        {
          productCode: "300002",
          productName: "中尺寸",
          price: 90,
          amount: 1,
          totalPrice: 90,
        },
        {
          productCode: "300005",
          productName: "草莓",
          price: 0,
          amount: 2,
          totalPrice: 0,
        },
      ],
    },
    {
      mainProductCode: "100002",
      mainProductName: "卡布奇诺咖啡",
      price: 600,
      amount: 2,
      totalPrice: 1200,
      smallProduct: [
        {
          productCode: "300001",
          productName: "大尺寸",
          price: 100,
          amount: 1,
          totalPrice: 100,
        },
      ],
    },
  ],
  TotalPrice: {
    totalPriceBeforeTax: 1790,
    taxRate: 0.13,
    tax: 232.7,
    shipFee: 0,
    otherFee: 200,
    totalPriceAfterTax: 2222.7,
  },
  status: "success",
  customerId: "bb",
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
  email: "njzhch@163.com",
  password: "123456",
  shopAddress: "",
  allShopAddress: [],
  firstName: "",
  lastName: "",
  status: "fail",
};
