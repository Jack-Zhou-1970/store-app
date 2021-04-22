import React from "react";

import { useEffect, useState, useRef } from "react";

import { Button, message, Modal, Divider } from "antd";
import { Row, Col } from "antd";

import history from "../history";

import PropTypes from "prop-types";

var ws = new WebSocket("ws://192.168.0.128:4242/ws/shop400001");

export function WebSocketControl() {
  function handle_click() {
    var req = new Object();
    req.orderNumber = "D21042280473";
    req.status = "process_pickUp";
    ws.send(JSON.stringify(req));
  }
  useEffect(() => {
    ws.onopen = function () {
      var result = new Object();
      result.status = "open";
      ws.send(JSON.stringify(result));
    };

    ws.onmessage = function (event) {
      var data = JSON.parse(event.data);
      console.log(data);
    };
  }, []);

  return (
    <div>
      <Button onClick={handle_click}>AAAA</Button>
    </div>
  );
}
