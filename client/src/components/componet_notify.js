import React from "react";

import { useEffect, useState, useRef } from "react";

import {
  Button,
  message,
  Modal,
  Divider,
  Tabs,
  Card,
  List,
  Pagination,
  Spin,
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

import { connect } from "react-redux";

import { processDataFromServer, howManyStatus } from "../manage_api";

var ws = new WebSocket("ws://192.168.0.128:4242/ws/shop400001");

export function WebSocketControl() {
  useEffect(() => {
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

      console.log(data);

      processDataFromServer(data);
    };

    ws.onclose = function (event) {
      console.log("disconnect");
    };
  }, []);

  return (
    <div>
      <div style={{ height: "50px" }}></div>
      <div style={{ marginLeft: "45%" }}>
        <h2>世界茶饮后台管理系统</h2>
      </div>
      <div style={{ marginLeft: "10%" }}>
        <Notify_container />
      </div>
    </div>
  );
}

const { TabPane } = Tabs;

function Notify_container() {
  return (
    <Tabs type="card">
      <TabPane tab="未接订单" key="1">
        <UnAcceptList />
      </TabPane>
      <TabPane tab="未提订单" key="2">
        <ReadyPickupList />
      </TabPane>
      <TabPane tab="完成订单" key="3">
        <CompleteList />
      </TabPane>
    </Tabs>
  );
}

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

function OrderList(props) {
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

function UnAcceptCard(props) {
  const [spinning, setSpinning] = useState(false);
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
      >
        <p>{props.paymentTime}</p>
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
    if (item.status == "requireCapture") {
      skipNumber++;
      if (skipNumber > startNumber && countNumber < 12) {
        countNumber++;
        var paymentTime = new Date(item.paymentTime);
        return (
          <UnAcceptCard
            orderNumber={item.orderNumber}
            product={item.product}
            paymentTime={paymentTime.toString()}
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
      >
        <p>{props.paymentTime}</p>
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
        请确认已经取走货物！
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
