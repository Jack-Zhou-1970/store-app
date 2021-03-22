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
//the payment infomation send from clent
const orderDetails = {
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
  status: "success",
  pickupTime: 2021 - 4 - 21,
  function: "pickup",
};

module.exports = {
  mimeType: mimeType,
  orderDetails: orderDetails,
};
