import React from "react";

import { useEffect, useState, useRef } from "react";

import { Button, message, Modal, Divider } from "antd";
import { Row, Col } from "antd";

import history from "../history";

import PropTypes from "prop-types";

export function WebSocketControl() {
  useEffect(() => {
    var ws = new WebSocket("ws://192.168.0.128:4242/ws/shop400001");

    ws.onopen = function () {
      ws.send("Hello Server!");
    };

    ws.onmessage = function (event) {
      var data = event.data;
      var data1 = JSON.parse(data);
      console.log(data1);
      console.log(data1.orderNumber);
    };
  }, []);

  return (
    <div>
      <Button>AAAA</Button>
    </div>
  );
}
