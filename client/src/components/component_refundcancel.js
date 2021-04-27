import React from "react";

import { useEffect, useState, useRef } from "react";

import {
  Button,
  Tabs,
  List,
  Spin,
  Input,
  Divider,
  Descriptions,
  DatePicker,
  Modal,
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

import { connect } from "react-redux";

import { processDataFromServer, howManyStatus } from "../manage_api";
import { OrderList } from "./componet_notify";

import api from "../api"; //important!!

import { ws } from "./componet_notify";

function RefundCancel_input(props) {
  const inputEl = useRef("");
  const inputEl1 = useRef("");

  function handle_click() {
    props.handle_click(
      inputEl.current.state.value,
      inputEl1.current.state.value
    );
  }

  return (
    <div style={{ marginTop: "2%", marginLeft: "5%" }}>
      <Row>
        <Col xs={2}>
          <h3>订单号码：</h3>
        </Col>
        <Col xs={4}>
          <Input ref={inputEl} type="text" />
        </Col>
        <Col xs={2} style={{ marginLeft: "4%" }}>
          <h3>退款金额：</h3>
        </Col>
        <Col xs={4}>
          <Input ref={inputEl1} type="text" />
        </Col>
        <Col xs={4} style={{ marginLeft: "2%" }}>
          <Button type="primary" onClick={handle_click}>
            退款或取消
          </Button>
        </Col>
      </Row>
    </div>
  );
}

function processStatus(status) {
  var result = "状态未知";

  switch (status) {
    case "refundCancelNotFind":
      result = "订单号错误";
      break;

    case "refundCancelNoNeed":
      result = "该笔订单没有产生金额或已经退款，无需再次退款";
      break;

    case "refundCancelCanNot":
      result = "无法查询到该笔订单付款信息，无法退款";
      break;

    case "refundFail":
      result = "未知原因，退款失败";
      break;

    case "refundSuccess":
      result = "退款成功";
      break;

    case "cancelSuccess":
      result = "该笔订单已被取消";
      break;

    default:
      break;
  }

  return result;
}

export function RefundCancel() {
  const [msg, setMsg] = useState("");
  const [visble, setVisble] = useState(false);
  const [spinning, setSpinning] = useState(false);

  function handle_click(orderNumber, amount) {
    var reqObj = new Object();
    reqObj.orderNumber = orderNumber;
    reqObj.amount = Number(amount) * 100;

    setSpinning(true);

    api.refundCancel(reqObj).then((result) => {
      setSpinning(false);
      setMsg(processStatus(result.content));
      setVisble(true);
      if (result.status == "success") {
        var req = new Object();
        req.status = "get_order_byShop";
        req.shopCode = "400001";

        ws.send(JSON.stringify(req));
      }
    });
  }

  function handle_cancel() {
    setVisble(false);
  }
  return (
    <div>
      <Spin spinning={spinning}>
        <RefundCancel_input handle_click={handle_click} />
        <Modal
          title="操作结果"
          visible={visble}
          onOk={handle_cancel}
          onCancel={handle_cancel}
          width={300}
          closable={false}
          centered={true}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
        >
          {msg}
        </Modal>
      </Spin>
    </div>
  );
}
