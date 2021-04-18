import React, { useEffect, useState } from "react";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";
import { Descriptions, List, Radio, Modal, Affix } from "antd";

import "antd/dist/antd.css";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";
import { object } from "prop-types";

function UserInfo(props) {
  return (
    <div style={{ marginTop: "2%" }}>
      <h3>下面是您本次订购的订单信息:</h3>
      <Descriptions title="用户信息:">
        <Descriptions.Item label="订单号">
          {props.orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="昵称">{props.nickName}</Descriptions.Item>
        <Descriptions.Item label="EMAIL">{props.email}</Descriptions.Item>
        <Descriptions.Item label="电话">{props.phone}</Descriptions.Item>
        <Descriptions.Item label="店铺地址">
          {props.shopAddress}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

function createData(subPrice) {
  var dataArray = [];

  if (subPrice == undefined) {
    return dataArray;
  }

  for (var i = 0; i < subPrice.length; i++) {
    var data = new Object();
    data.mainProduct =
      subPrice[i].mainProductName +
      "      单价:$" +
      (subPrice[i].price / 100).toString() +
      "      数量:" +
      subPrice[i].amount +
      "    总价(含加料):$" +
      (subPrice[i].totalPrice / 100).toString();
    data.smallProduct = "";
    for (var j = 0; j < subPrice[i].smallProduct.length; j++) {
      var amount =
        subPrice[i].smallProduct[j].price > 0
          ? "*" + subPrice[i].smallProduct[j].amount
          : "";
      data.smallProduct =
        data.smallProduct +
        subPrice[i].smallProduct[j].productName +
        amount +
        "         ";
    }
    dataArray.push(data);
  }

  return dataArray;
}

function OrderList(props) {
  const data = createData(props.subPrice);
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

function TotalPrice(props) {
  return (
    <div style={{ marginTop: "2%" }}>
      <Descriptions title="订单汇总:">
        <Descriptions.Item label="税前价格:$">
          {(props.totalPriceBeforeTax / 100).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="运输费用">
          {(props.shipFee / 100).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="其它费用">
          {(props.otherFee / 100).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="税率">{props.taxRate}</Descriptions.Item>
        <Descriptions.Item label="税费">
          {" "}
          {(props.tax / 100).toFixed(2).toString()}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: "2%" }}>
        <h2>税后总价: ${(props.totalPriceAfterTax / 100).toString()}</h2>
      </div>
    </div>
  );
}

function PaymentMethod(props) {
  const radioStyle = {
    display: "block",
    height: "30px",
    lineHeight: "30px",
  };

  const [processing, setProcessing] = useState(false);
  const [isModalVisible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  var ini_value = props.last4 == "" || props.last4 == undefined ? 2 : 1;
  const [value, setValue] = useState(ini_value);

  function handle_home() {
    var inputObj = new Object();
    inputObj.orderNumber = props.orderNumber;

    api.deleteUnPayment(inputObj).then((result) => {
      history.push("/home");
    });
  }

  function handle_cart() {
    var inputObj = new Object();
    inputObj.orderNumber = props.orderNumber;

    api.deleteUnPayment(inputObj).then((result) => {
      history.push("/cart");
    });
  }

  function handle_payment() {
    if (succeeded == true) {
      history.push("/home");
    } else {
      history.push("payment_2");
    }
    setVisible(false);
  }

  function handle_normal_pay() {
    if (value == 2 && props.orderInfo.totalPrice > 0) {
      history.push("payment_2");
    } else {
      //payment direct
      setProcessing(true);
      var paymentDetails = createPaymentDetail(
        props.orderInfo.orderProduct,
        props.userInfo
      );
      paymentDetails.orderNumber = props.orderNumber;
      api.direct_pay(paymentDetails).then((result) => {
        setProcessing(false);
        if (result.status == "requireCapture") {
          setSucceeded(true);
          //clean shoppingCart
          store.dispatch({
            type: "DEL_ALL_ORDER_PRODUCT",
          });

          //update reward info
          store.dispatch({
            type: "UPDATE_REWARD",
            payload: result.reward,
          });

          setMessage("支付成功，请记下您的订单号" + props.orderNumber);
          setVisible(true);
        } else {
          setSucceeded(false);
          setMessage("支付失败，请换新卡支付!");
          setVisible(true);
        }
      });
    }
  }

  function onChange(e) {
    setValue(e.target.value);
  }
  return (
    <div style={{ marginTop: "5%" }}>
      <div xs={8}>
        <h3>请选择付款方式：</h3>
        <Radio.Group
          onChange={onChange}
          defaultValue={props.last4 == "" || props.last4 == undefined ? 2 : 1}
        >
          <Radio
            style={radioStyle}
            disabled={
              props.last4 == "" ||
              props.last4 == undefined ||
              props.orderInfo.totalPrice < 0.01
            }
            value={1}
          >
            使用尾号为{props.last4}的信用卡付款
          </Radio>
          <Radio
            style={radioStyle}
            value={2}
            disabled={props.orderInfo.totalPrice < 0.01}
          >
            使用新的信用卡付款
          </Radio>
        </Radio.Group>
      </div>
      <Affix offsetBottom={10} style={{ marginLeft: "5%", marginTop: "10%" }}>
        <Row>
          <Col xs={4} style={{ marginRight: "8%" }}>
            <Button
              type="primary"
              disabled={processing}
              onClick={handle_normal_pay}
            >
              {processing ? "支付中…" : "结账"}
            </Button>
          </Col>
          <Col xs={4} style={{ marginRight: "8%" }}>
            <Button onClick={handle_home}>主页</Button>
          </Col>
          <Col xs={4}>
            <Button onClick={handle_cart}>购物车</Button>
          </Col>
        </Row>
      </Affix>
      <Modal
        title="支付结果"
        visible={isModalVisible}
        onOk={handle_payment}
        width={300}
        closable={false}
        centered={true}
        cancelButtonProps={{ disabled: true }}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        {message}
      </Modal>
    </div>
  );
}

///////////////////////////////////
export function createPaymentDetail(orderProduct, userInfo) {
  var paymentDetail = new Object();

  paymentDetail.userCode = userInfo.userCode;
  paymentDetail.email = userInfo.email;
  paymentDetail.otherFee = 0; //for test

  paymentDetail.shopAddress = userInfo.shopAddress;

  paymentDetail.product = [];
  for (var i = 0; i < orderProduct.length; i++) {
    paymentDetail.product.push(orderProduct[i]);
  }

  if (orderProduct.reward_out != undefined && orderProduct.reward_out != "") {
    paymentDetail.reward_out = orderProduct.reward_out;
  } else {
    paymentDetail.reward_out = 0;
  }

  /*paymentDetail.reward_out = 100;*/

  return paymentDetail;
}

export function BillInfo(props) {
  const [billInfo, setBillInfo] = useState({});

  useEffect(() => {
    //forbidden back
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });
    // Step 1:get bill info and display to customer to confirm
    api
      .getBillInfo(
        createPaymentDetail(props.orderInfo.orderProduct, props.userInfo)
      )
      .then((result) => {
        setBillInfo(result);

        store.dispatch({
          type: "MOD_TOTAL_PRICE",
          totalPrice: result.TotalPrice.totalPriceAfterTax,
        });

        store.dispatch({
          type: "MOD_ORDER_NUMBER",
          orderNumber: result.orderNumber,
        });
      });
  }, []);

  if (billInfo.TotalPrice != undefined) {
    return (
      <div style={{ marginTop: "5%", marginLeft: "10%" }}>
        <UserInfo
          orderNumber={billInfo.orderNumber}
          nickName={props.userInfo.nickName}
          email={props.userInfo.email}
          phone={props.userInfo.phone}
          shopAddress={props.userInfo.shopAddress}
        />
        <div style={{ marginTop: "2%" }}>
          <h3>购买详情：</h3>
          <OrderList subPrice={billInfo.subPrice} />
        </div>
        <TotalPrice
          totalPriceBeforeTax={billInfo.TotalPrice.totalPriceBeforeTax}
          shipFee={billInfo.TotalPrice.shipFee}
          otherFee={billInfo.TotalPrice.otherFee}
          taxRate={billInfo.TotalPrice.taxRate}
          tax={billInfo.TotalPrice.tax}
          totalPriceAfterTax={billInfo.TotalPrice.totalPriceAfterTax}
        />
        <PaymentMethod
          last4={billInfo.last4}
          orderNumber={billInfo.orderNumber}
          orderInfo={props.orderInfo}
          userInfo={props.userInfo}
        />
      </div>
    );
  } else return <div></div>;
}

const mapStateToProps_BillInfo = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
    userInfo: state.userInfoReducer,
  };
};

BillInfo = connect(mapStateToProps_BillInfo)(BillInfo);
