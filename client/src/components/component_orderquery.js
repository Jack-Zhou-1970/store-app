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
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

import { connect } from "react-redux";

import { processDataFromServer, howManyStatus } from "../manage_api";
import { OrderList } from "./componet_notify";
import { UserInfo } from "./component_directpay";

import api from "../api"; //import!!

const { TabPane } = Tabs;

export function OrderQuery_container() {
  return (
    <Tabs type="card">
      <TabPane tab="订单号查询" key="1">
        <OrderNumberQuery />
      </TabPane>
      <TabPane tab="时间订单查询" key="2">
        <OrderInfoDateQuery />
      </TabPane>
      <TabPane tab="时间品种查询" key="3">
        <ProductInfoDateQuery />
      </TabPane>
    </Tabs>
  );
}

function OrderNumber_input(props) {
  const inputEl = useRef("");

  function handle_click() {
    props.handle_click(inputEl.current.state.value);
  }

  return (
    <div style={{ marginTop: "2%", marginLeft: "10%" }}>
      <Row>
        <Col xs={3}>
          <h3>请输入订单号码：</h3>
        </Col>
        <Col xs={4}>
          <Input ref={inputEl} type="text" />
        </Col>
        <Col xs={4} style={{ marginLeft: "2%" }}>
          <Button type="primary" onClick={handle_click}>
            查询
          </Button>
        </Col>
      </Row>
    </div>
  );
}

function processOrderStatus(status) {
  var result = "状态未知";

  switch (status) {
    case "readyPayment":
      result = "付款没有完成";
      break;

    case "requireCapture":
      result = "付款完成，等待确认";
      break;

    case "success":
      result = "付款完成，等待确认";
      break;

    case "readyPickup":
      result = "已确认，等待提货";
      break;

    case "complete":
      result = "订单已完结";
      break;

    case "refund":
      result = "订单已经退款";
      break;

    case "cancel":
      result = "订单已经取消";
      break;

    case "afterPayment":
      result = "到店付款，款未付";
      break;

    default:
      break;
  }

  return result;
}

function OrderDetail(props) {
  var paymentTime = new Date(props.paymentTime);
  return (
    <div>
      <Descriptions title="商品信息:">
        <Descriptions.Item label="订单号">
          {props.orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="总价(税后)">
          {(props.totalPrice / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="付款时间">
          {paymentTime.toString()}
        </Descriptions.Item>
        <Descriptions.Item label="订单状态">
          {processOrderStatus(props.orderStatus)}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

function OrderNumberQuery() {
  const [visble, setVisble] = useState(false);
  const [orderInfo, setOrderInfo] = useState("");
  const [userInfo, setUserInfo] = useState("");

  function handle_click(value) {
    var data = new Object();
    data.orderNumber = value;
    api.getOrderNumberQuery(data).then((result) => {
      if (result.length > 0) {
        setOrderInfo(result[0]);
        api.getUserInfoQuery(data).then((result) => {
          if (result.length > 0) {
            console.log(result);
            setUserInfo(result[0]);
            setVisble(true);
          } else {
            setVisble(false);
          }
        });
      } else {
        setVisble(false);
      }
    });
  }

  return (
    <div>
      <OrderNumber_input handle_click={handle_click} />
      <div
        style={{
          display: visble == true && orderInfo != {} ? "block" : "none",
          marginTop: "5%",
        }}
      >
        <UserInfo
          orderNumber={orderInfo.orderNumber}
          nickName={userInfo.nickName}
          email={userInfo.email}
          phone={userInfo.phone}
          shopAddress={userInfo.pickupShop}
        />
        <OrderDetail
          orderNumber={orderInfo.orderNumber}
          totalPrice={orderInfo.totalPrice}
          paymentTime={orderInfo.paymentTime}
          orderStatus={orderInfo.status}
        />

        <OrderList product={orderInfo.product} />
      </div>
    </div>
  );
}

/////////////////////////////////////////////////////////////
const { RangePicker } = DatePicker;
function OrderTime_input(props) {
  function onChange(time, timeString) {
    console.log(timeString);
    props.handle_click(timeString[0], timeString[1]);
  }

  return (
    <div style={{ marginTop: "2%", marginLeft: "10%" }}>
      <Row>
        <Col xs={3}>
          <h3>请选择时间区间：</h3>
        </Col>
        <Col xs={6}>
          <RangePicker onChange={onChange} />
        </Col>
        <Col xs={3} style={{ marginLeft: "2%" }}>
          <h2>总金额：${(props.totalAmount / 100).toFixed(2).toString()}</h2>
        </Col>

        <Col xs={3} style={{ marginLeft: "2%" }}>
          <h2>单数:{props.totalNumber.toString()}</h2>
        </Col>
      </Row>
    </div>
  );
}

function calTotalAmount(orderInfo) {
  if (orderInfo.length == 0) {
    return 0;
  }

  var total = 0;

  for (var i = 0; i < orderInfo.length; i++) {
    total = total + orderInfo[i].totalPrice;
  }

  return total;
}

function OrderInfoDateQuery() {
  const [visble, setVisble] = useState(false);
  const [orderInfo, setOrderInfo] = useState([]);

  function handle_click(start_date, end_date) {
    var dateObj = new Object();

    dateObj.start_date = start_date;
    dateObj.end_date = end_date;

    api.getOrderByDateQuery(dateObj).then((result) => {
      if (result.length > 0) {
        setOrderInfo(result);
        setVisble(true);
      } else {
        setVisble(false);
      }
    });
  }

  const orderInfoList = orderInfo.map((item) => {
    return (
      <div style={{ marginBottom: "2%" }}>
        <OrderDetail
          orderNumber={item.orderNumber}
          totalPrice={item.totalPrice}
          paymentTime={item.paymentTime}
          orderStatus={item.status}
        />

        <OrderList product={item.product} />
      </div>
    );
  });

  return (
    <div>
      <OrderTime_input
        totalAmount={calTotalAmount(orderInfo)}
        totalNumber={orderInfo.length}
        handle_click={handle_click}
      />
      <div
        style={{
          display: visble == true && orderInfo.length > 0 ? "block" : "none",
          marginTop: "5%",
        }}
      >
        {orderInfoList}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////

function ProductTime_input(props) {
  function onChange(time, timeString) {
    console.log(timeString);
    props.handle_click(timeString[0], timeString[1]);
  }

  return (
    <div style={{ marginTop: "2%", marginLeft: "10%" }}>
      <Row>
        <Col xs={3}>
          <h3>请选择时间区间：</h3>
        </Col>
        <Col xs={8}>
          <RangePicker onChange={onChange} />
        </Col>
      </Row>
    </div>
  );
}

function ProductInfoDateQuery() {
  const [visble, setVisble] = useState(false);
  const [productInfo, setProductInfo] = useState([]);

  function handle_click(start_date, end_date) {
    var dateObj = new Object();

    dateObj.start_date = start_date;
    dateObj.end_date = end_date;

    api.getProductByDateQuery(dateObj).then((result) => {
      if (result.length > 0) {
        console.log(result);
        setProductInfo(result);
        setVisble(true);
      } else {
        setVisble(false);
      }
    });
  }

  const productInfoList = productInfo.map((item) => {
    return (
      <div style={{ marginBottom: "2%" }}>
        <Row>
          <Col xs={6} style={{ fontSize: "15px" }}>
            {item.productName_c}
          </Col>
          <Col xs={4} style={{ fontSize: "15px" }}>
            {item.total}
          </Col>
        </Row>
      </div>
    );
  });

  return (
    <div>
      <ProductTime_input handle_click={handle_click} />
      <div
        style={{
          display: visble == true && productInfo.length > 0 ? "block" : "none",
          marginTop: "2%",
          marginLeft: "15%",
        }}
      >
        <Row style={{ marginBottom: "2%" }}>
          <Col xs={6} style={{ fontWeight: "150%", fontSize: "25px" }}>
            名称
          </Col>
          <Col xs={4} style={{ fontWeight: "150%", fontSize: "25px" }}>
            杯数
          </Col>
        </Row>
        <Divider />
        {productInfoList}
      </div>
    </div>
  );
}
