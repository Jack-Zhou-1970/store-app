import React from "react";

import { useEffect, useState, useRef } from "react";

import {
  Button,
  Modal,
  Tabs,
  Card,
  List,
  Pagination,
  Spin,
  Badge,
  Switch,
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

import { connect } from "react-redux";

import { store } from "../app";

import { processDataFromServer, howManyStatus } from "../manage_api";

import { OrderQuery_container } from "./component_orderquery";
import { RefundCancel } from "./component_refundcancel";

import capture from "../../images/capture.png";
import pickup from "../../images/pickup.png";
import complete from "../../images/complete.png";

import { fixControlledValue } from "antd/lib/input/Input";

import {
  printComponent,
  printExistingElement,
  printHtml,
} from "react-print-tool";
import { convertLegacyProps } from "antd/lib/button/button";

export var ws;

export var timer1 = null,
  timer2;

export var link_count = 0;

var audio = null;

function ws_init(setPlaying) {
  ws = new WebSocket("wss://www.worldtea.ca/ws/shop400001");
  /* ws = new WebSocket("ws://127.0.0.1:4243/ws/shop400001");*/

  ws.onopen = function () {
    //get order_by _shop

    console.log("begin to get order by shop");
    var req = new Object();
    req.status = "get_order_byShop";
    req.shopCode = "400001";

    ws.send(JSON.stringify(req));
  };

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    processDataFromServer(data, setPlaying);
  };

  ws.onclose = function (event) {
    console.log("disconnect");
    /*setTimeout(function () {
      ws_init();
    }, 3000);*/
  };
}

export function WebSocketControl(props) {
  const [playing, setPlaying] = useState(true);
  const [isVisble, setVisble] = useState(false);

  function handle_cancel() {
    setVisble(false);
    history.push("/");
  }

  useEffect(() => {
    ws_init(setPlaying);
  }, []);

  try {
    if (playing) {
      audio = new Audio("alert.mp3");
      audio.load();
      audio.play();
    } else {
      if (audio != null) {
        audio.pause();
      }
    }
  } catch (err) {
    console.log(err);
  }

  if (isVisble == false && timer1 == null) {
    timer1 = setInterval(() => {
      var req = new Object();
      req.status = "heartBeat";
      ws.send(JSON.stringify(req));

      /*console.log(link_count);*/

      timer2 = setTimeout(() => {
        console.log(link_count);
        link_count++;
        if (link_count < 5) {
          audio = new Audio("alert.mp3");
          audio.load();
          audio.play();
          ws_init();
        } else {
          link_count = 0;
          clearInterval(timer1);
          timer1 = null;

          setVisble(true);
        }
      }, 10000);
    }, 20000);
  }

  return (
    <div>
      <div>
        <div
          style={{ width: "3%", position: "absolute", top: "5%", left: "2%" }}
        >
          <Badge
            count={howManyStatus(props.orderList, "requireCapture")}
            overflowCount={1000}
            offset={[20, 0]}
          >
            <img src={capture} style={{ width: "100%" }} />
          </Badge>
        </div>
        <div
          style={{ width: "3%", position: "absolute", top: "15%", left: "2%" }}
        >
          <Badge
            count={howManyStatus(props.orderList, "readyPickup")}
            overflowCount={1000}
            offset={[20, 0]}
          >
            <img src={pickup} style={{ width: "100%" }} />
          </Badge>
        </div>
        <div
          style={{ width: "3%", position: "absolute", top: "25%", left: "2%" }}
        >
          <Badge
            count={howManyStatus(props.orderList, "complete")}
            overflowCount={1000}
            offset={[20, 0]}
          >
            <img src={complete} style={{ width: "100%" }} />
          </Badge>
        </div>
      </div>
      <div style={{ marginLeft: "45%" }}>
        <h1>世界茶饮后台管理系统</h1>
      </div>
      <div style={{ marginLeft: "10%" }}>
        <Notify_container />
      </div>
      <Modal
        title="连接错误"
        visible={isVisble}
        onOk={handle_cancel}
        onCancel={handle_cancel}
        width={300}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        和服务器连接错误，请检查网络连接
      </Modal>
    </div>
  );
}

const mapStateToProps_WebSocketControl = (state) => {
  return {
    orderList: state.orderListReducer,
  };
};

WebSocketControl = connect(mapStateToProps_WebSocketControl)(WebSocketControl);

const { TabPane } = Tabs;

function Notify_container(props) {
  function onchange(key) {
    if (key == "6") {
      store.dispatch({
        type: "DELETE_MANAGE_STATUS",
      });
      history.push("/");
    }
  }

  function handle_change(checked) {
    if (checked) {
      store.dispatch({
        type: "UPDATE_ORDER_FUN",
        payload: "byDate",
      });
    } else {
      store.dispatch({
        type: "UPDATE_ORDER_FUN",
        payload: "byNumber",
      });
    }
  }
  return (
    <div>
      <div>
        <Tabs type="card" onChange={onchange}>
          <TabPane tab="未接订单" key="1">
            <UnAcceptList />
          </TabPane>
          <TabPane tab="未提订单" key="2">
            <ReadyPickupList />
          </TabPane>
          <TabPane tab="完成订单" key="3">
            <CompleteList />
          </TabPane>
          <TabPane tab="订单查询" key="4">
            <div
              style={{
                display:
                  props.status == "LEVEL2" || props.status == "LEVEL3"
                    ? "block"
                    : "none",
              }}
            >
              <OrderQuery_container />
            </div>
          </TabPane>
          <TabPane tab="退单积分处理" key="5">
            <div
              style={{
                display: props.status == "LEVEL3" ? "block" : "none",
              }}
            >
              <RefundCancel />
            </div>
          </TabPane>
          <TabPane tab="退出后台" key="6"></TabPane>
        </Tabs>
      </div>
      <div style={{ position: "absolute", top: "35%", left: "2%" }}>
        <Switch
          checkedChildren="按时间排列"
          unCheckedChildren="按订单号排列"
          defaultChecked
          onChange={handle_change}
        />
      </div>
    </div>
  );
}

const mapStateToProps_Notify_container = (state) => {
  return {
    status: state.manageReducer,
  };
};

Notify_container = connect(mapStateToProps_Notify_container)(Notify_container);

function createData(product) {
  var dataArray = [];

  if (product == undefined) {
    return dataArray;
  }

  for (var i = 0; i < product.length; i++) {
    var data = new Object();
    data.mainProduct =
      product[i].mainProductName + "      数量:" + product[i].amount;

    data.smallProduct = "";
    for (var j = 0; j < product[i].smallProduct.length; j++) {
      var amount =
        product[i].smallProduct[j].amount > 0
          ? "*" + product[i].smallProduct[j].amount
          : "";
      data.smallProduct =
        data.smallProduct +
        product[i].smallProduct[j].smallProductName +
        amount +
        "         ";
    }
    dataArray.push(data);
  }

  return dataArray;
}

export function OrderList(props) {
  const data = createData(props.product);
  return (
    <List
      itemLayout="horizontal"
      split={false}
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.mainProduct}
            description={item.smallProduct}
          />
        </List.Item>
      )}
    />
  );
}

function OrderList_print(props) {
  const data = createData(props.product);
  return (
    <div style={{ marginLeft: "20%" }}>
      <h3>待处理单号：{props.orderNumber}</h3>
      <List
        itemLayout="horizontal"
        split={false}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.mainProduct}
              description={item.smallProduct}
            />
          </List.Item>
        )}
      />
    </div>
  );
}

function UnAcceptCard(props) {
  const [spinning, setSpinning] = useState(false);

  async function handle_dblClick() {
    await printComponent(
      <OrderList_print
        product={props.product}
        orderNumber={props.orderNumber}
      />
    );
  }

  function handle_click() {
    var req = new Object();
    req.status = "process_capture";
    req.orderNumber = props.orderNumber;

    ws.send(JSON.stringify(req));

    setSpinning(true);
  }
  return (
    <Col span={6} style={{ marginBottom: "2%" }}>
      <Card
        title={props.orderNumber}
        extra={
          <Spin spinning={spinning}>
            <Button type="primary" onClick={handle_click}>
              接单
            </Button>
          </Spin>
        }
        style={{ width: 300 }}
        onDoubleClick={handle_dblClick}
      >
        <p>{props.paymentTime}</p>
        {props.status == "afterPayment" ? (
          <h3 style={{ color: "red" }}>
            未付金额:${(props.totalPrice / 100).toFixed(2).toString()}
          </h3>
        ) : (
          <p>金额:${(props.totalPrice / 100).toFixed(2).toString()}</p>
        )}
        <OrderList product={props.product} />
      </Card>
    </Col>
  );
}

function UnAcceptList(props) {
  const [page, setPage] = useState(1);

  function handle_change(current, pageSize) {
    setPage(current);
  }

  var startNumber = (page - 1) * 12;
  var skipNumber = 0;
  var countNumber = 0;

  const unAcceptList = props.orderList.map((item, index) => {
    if (
      item.status == "requireCapture" ||
      item.status == "success" ||
      item.status == "afterPayment"
    ) {
      skipNumber++;
      if (skipNumber > startNumber && countNumber < 12) {
        countNumber++;
        var paymentTime = new Date(item.paymentTime);
        return (
          <UnAcceptCard
            orderNumber={item.orderNumber}
            product={item.product}
            paymentTime={paymentTime.toString()}
            totalPrice={item.totalPrice}
            status={item.status}
          />
        );
      }
    }
  });

  return (
    <div>
      <Row gutter={8}>{unAcceptList}</Row>
      <Pagination
        style={{ marginLeft: "35%" }}
        defaultCurrent={1}
        total={howManyStatus(props.orderList, "requireCapture")}
        defaultPageSize={12}
        showSizeChanger={false}
        onChange={handle_change}
      />
    </div>
  );
}

const mapStateToProps_UnAcceptList = (state) => {
  return {
    orderList: state.orderListReducer,
  };
};

UnAcceptList = connect(mapStateToProps_UnAcceptList)(UnAcceptList);

///////////////////////////////////////////////////////////////////////////

function CompleteCard(props) {
  return (
    <Col span={6} style={{ marginBottom: "2%" }}>
      <Card title={props.orderNumber} style={{ width: 300 }}>
        <p>{props.paymentTime}</p>
        <p>金额:${(props.totalPrice / 100).toFixed(2).toString()}</p>
        <OrderList product={props.product} />
      </Card>
    </Col>
  );
}

function CompleteList(props) {
  const [page, setPage] = useState(1);

  function handle_change(current, pageSize) {
    setPage(current);
  }

  var startNumber = (page - 1) * 12;
  var skipNumber = 0;
  var countNumber = 0;

  const completeList = props.orderList.map((item, index) => {
    if (item.status == "complete") {
      skipNumber++;
      if (skipNumber > startNumber && countNumber < 12) {
        countNumber++;
        var paymentTime = new Date(item.paymentTime);
        return (
          <CompleteCard
            orderNumber={item.orderNumber}
            product={item.product}
            paymentTime={paymentTime.toString()}
            totalPrice={item.totalPrice}
          />
        );
      }
    }
  });

  return (
    <div>
      <Row gutter={8}>{completeList}</Row>
      <Pagination
        style={{ marginLeft: "35%" }}
        defaultCurrent={1}
        total={howManyStatus(props.orderList, "complete")}
        defaultPageSize={12}
        showSizeChanger={false}
        onChange={handle_change}
      />
    </div>
  );
}

const mapStateToProps_CompleteList = (state) => {
  return {
    orderList: state.orderListReducer,
  };
};

CompleteList = connect(mapStateToProps_CompleteList)(CompleteList);

//////////////////////////////////////////////////////////////////////

function ReadyPickupCard(props) {
  const [spinning, setSpinning] = useState(false);
  const [isPickupVisible, setVisble] = useState(false);
  function handle_click() {
    setVisble(true);
  }

  async function handle_dblClick() {
    await printComponent(
      <OrderList_print
        product={props.product}
        orderNumber={props.orderNumber}
      />
    );
  }

  function handle_ok() {
    var req = new Object();
    req.status = "process_pickUp";
    req.orderNumber = props.orderNumber;

    ws.send(JSON.stringify(req));

    setSpinning(true);
    setVisble(false);
  }

  function handle_cancel() {
    setVisble(false);
  }
  return (
    <Col span={6} style={{ marginBottom: "2%" }}>
      <Card
        title={props.orderNumber}
        extra={
          <Spin spinning={spinning}>
            <Button type="primary" onClick={handle_click}>
              取货确认
            </Button>
          </Spin>
        }
        style={{ width: 300 }}
        onDoubleClick={handle_dblClick}
      >
        <p>{props.paymentTime}</p>
        {props.status1 == "nopay" ? (
          <h3 style={{ color: "red" }}>
            未付金额:${(props.totalPrice / 100).toFixed(2).toString()}
          </h3>
        ) : (
          <p>金额:${(props.totalPrice / 100).toFixed(2).toString()}</p>
        )}
        <OrderList product={props.product} />
      </Card>
      <Modal
        title="确认"
        visible={isPickupVisible}
        onOk={handle_ok}
        onCancel={handle_cancel}
        width={300}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        {props.status1 == "nopay"
          ? "请确认用户完成支付并已经取走货物！"
          : "请确认用户已经取走货物"}
      </Modal>
    </Col>
  );
}

function ReadyPickupList(props) {
  const [page, setPage] = useState(1);

  function handle_change(current, pageSize) {
    setPage(current);
  }

  var startNumber = (page - 1) * 12;
  var skipNumber = 0;
  var countNumber = 0;

  const readyPickupList = props.orderList.map((item, index) => {
    if (item.status == "readyPickup") {
      skipNumber++;
      if (skipNumber > startNumber && countNumber < 12) {
        countNumber++;
        var paymentTime = new Date(item.paymentTime);
        return (
          <ReadyPickupCard
            orderNumber={item.orderNumber}
            product={item.product}
            paymentTime={paymentTime.toString()}
            totalPrice={item.totalPrice}
            status1={item.status1}
          />
        );
      }
    }
  });

  return (
    <div>
      <Row gutter={8}>{readyPickupList}</Row>
      <Pagination
        style={{ marginLeft: "35%" }}
        defaultCurrent={1}
        total={howManyStatus(props.orderList, "readyPickup")}
        defaultPageSize={12}
        showSizeChanger={false}
        onChange={handle_change}
      />
    </div>
  );
}

const mapStateToProps_ReadyPickupList = (state) => {
  return {
    orderList: state.orderListReducer,
  };
};

ReadyPickupList = connect(mapStateToProps_ReadyPickupList)(ReadyPickupList);
