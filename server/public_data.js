const mimeType = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/x-font-ttf",
};

//for test
//the order infomation produced by server and send to db
const orderDetails = {
  //from client
  userCode: "000003",
  address: "99 cottonwood crt",
  city: "markham",
  province: "on",
  country: "canada",
  postalCode: "l5T 5z1",

  firstName: "li",
  lastName: "he",
  product: [
    {
      mainProductCode: "100001",
      amount: 1,
      smallProduct: [
        { productCode: "300002", amount: 1 },
        { productCode: "300005", amount: 2 },
      ],
    },

    {
      mainProductCode: "100002",
      amount: 2,
      smallProduct: [{ productCode: "300001", amount: 1 }],
    },
  ],

  shipFun: "pickup",
  rdyPickupTime: 0,
  //from server
  orderNumber: "D00001",
  tax: 100,
  shipping: 0,
  otherFee: 0,
  paymentMethod: "card",
  totalAmount: "1200",
  paymentTime: 0,
  shopCode: "400001",
  orderStatus: "ready",
};

//The payment detail send from client
const paymentDetails = {
  //from client
  userCode: "000003",
  address: "99 cottonwood crt",
  city: "markham",
  province: "on",
  country: "canada",
  postalCode: "l5T 5z1",

  firstName: "li",
  lastName: "he",
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

  shipFun: "pickup",
  rdyPickupTime: 0,
  paymentMethod: "card",
  status: "success",
};

module.exports = {
  mimeType: mimeType,
  orderDetails: orderDetails,
  paymentDetails: paymentDetails,
};
