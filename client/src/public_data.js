//for test

import { object } from "prop-types";

//The payment detail send from client before payment is complete
export const paymentDetails = {
  //from client
  userCode: "C21032780577",
  orderNumber: "",
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
  paymentInstend: "",
  customerId: "",
};

//used to upload user register info to server
export const userInfo_6 = {
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

//The data is sent to server by client when it is open the app,and server will send back to clent with userCode，this is also userInfo rerducer

export const loginInfo = {
  userCode: "",
  email: "",
  nickName: "",
  password: "",
  shopAddress: "",
  phone: "",
  allShopAddress: [],
  address: "", //new card  payment used
  city: "", //new card  payment used
  province: "ON", //new card  payment used
  country: "canada", //new card  payment used
  postalCode: "", //new card  payment used
  firstName: "", //new card  payment used
  lastName: "", //new card  payment used

  status: "success",
};

//The data is productList reducer  and get from server

export const productList = [
  {
    catalogName: "奶茶类",
    product: [
      {
        mainProductName: "珍珠奶茶",
        productIntro: "",
        price: 500,
        picFileName: "",
        productMiddle: [
          {
            middleProductName: "",
            productSmall: [{ smallProductName: "", smallPrice: 50 }],
          },
          {
            middleProductName: "",
            productSmall: [{ smallProductName: "", smallPrice: 60 }],
          },
        ],
      },
      {
        mainProductName: "草莓奶茶",
        productIntro: "",
        price: 600,
        picFileName: "",
        productMiddle: [
          {
            middleProductName: "",
            productSmall: [{ smallProductName: "", smallPrice: 50 }],
          },
          {
            middleProductName: "",
            productSmall: [{ smallProductName: "", smallPrice: 60 }],
          },
        ],
      },
    ],
  },
  {
    className: "咖啡类",
    product: [
      {
        mainProductName: "卡布奇诺咖啡",
        productIntro: "",
        price: 1200,
        picFileName: "",
        productMiddle: [
          {
            middleProductName: "",
            productSmall: [{ smallProductName: "", smallPrice: 50 }],
          },
          {
            middleProductName: "",
            productSmall: [{ smallProductName: "", smallPrice: 60 }],
          },
        ],
      },
    ],
  },
];

//The data is orderInfo reducer  and send to server
export const orderInfoIni = {
  orderNumber: "",
  orderProduct: [],

  otherFee: 0,
  paymentMethod: "card",

  shipFun: "pickup",
  rdyPickupTime: new Date(),
};

export const actionIni = {
  className: "全部产品",
  productName: "",
};

//reducer = loginInfo+productList+orderInfo+action
