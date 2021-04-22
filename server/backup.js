const express = require("express");
const expressWs = require("express-ws");

const fun_notify = require("./fun_notify");

var EventEmitter = require("events").EventEmitter;
// 实例化EventEmitter对象
var ee = new EventEmitter();

const router_ws = express.Router();
expressWs(router_ws);

router_ws.ws("/shop400001", function (ws, req) {
  //the function used to send to clent to notify
  function notifyShop(json) {
    console.log("json");
    console.log(ws.readyState);

    var result = JSON.parse(json);

    if (ws.readyState == 1) {
      ws.send(json);
    }
  }

  ws.on("message", function (msg) {
    // 业务代码

    console.log("receive msg");

    var req = JSON.parse(msg);
    var result;

    switch (req.status) {
      case "get_order_byShop":
        result = await fun_notify.getOrderInfoByShopCode(req);

        ws.send(JSON.stringify(fun_notify.get_order_byShop(result)));
        break;

      case "process_capture":
        result = await fun_notify.processCapture(req.orderNumber);
        ws.send(JSON.stringify(result));

        break;
      case "process_pickUp":
        result = await fun_notify.processPickUp(req.orderNumber);
        ws.send(JSON.stringify(result));

        break;
      default:
        break;
    }
  });

  ee.on("paymentComplete", notifyShop);

  ws.on("close", function () {
    // 业务代码
    console.log("close");
    ee.removeListener("paymentComplete", notifyShop);
  });

  next();
});

module.exports = {
  router_ws: router_ws,
  ee: ee,
};