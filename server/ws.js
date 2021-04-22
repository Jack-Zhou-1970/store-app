const express = require("express");
const expressWs = require("express-ws");

var EventEmitter = require("events").EventEmitter;
// 实例化EventEmitter对象
var ee = new EventEmitter();

const router_ws = express.Router();
expressWs(router_ws);

router_ws.ws("/shop400001", function (ws, req) {
  function notifyShop(json) {
    console.log("json");
    console.log(ws.readyState);

    if (ws.readyState == 1) {
      ws.send(json);
    }
  }

  ws.on("message", function (msg) {
    // 业务代码

    console.log("receive msg");
    console.log(msg);
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
