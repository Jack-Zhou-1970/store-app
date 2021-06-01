import React, { useEffect, useState, useRef } from "react";

import api from "../api";

import { Button, Divider } from "antd";
import { Row, Col } from "antd";
import {
  Form,
  Descriptions,
  List,
  Radio,
  Modal,
  Affix,
  Spin,
  Space,
  Input,
} from "antd";

import "antd/dist/antd.css";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";
import { object } from "prop-types";

import home from "../../images/home.svg";
import cart from "../../images/cart.svg";
import wechat from "../../images/wechat.png";
import alipay from "../../images/alipay.png";

export function UserInfo(props) {
  return (
    <div>
      <Descriptions title="Order Info:">
        <Descriptions.Item label="Order number:">
          {props.orderNumber}
        </Descriptions.Item>

        <Descriptions.Item label="Pickup address:">
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
      "(" +
      subPrice[i].productIntro +
      ")," +
      "      Quantity:" +
      subPrice[i].amount +
      ", " +
      "    Price:$" +
      (subPrice[i].totalPrice / 100).toFixed(2).toString();
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
      <Descriptions title="Order Summary:">
        <Descriptions.Item label="Subtotal">
          ${(props.totalPriceBeforeTax / 100).toFixed(2).toString()}
        </Descriptions.Item>

        <Descriptions.Item label="Use points to deduct the price">
          ${(props.totalMoney / 100).toFixed(2).toString()}
        </Descriptions.Item>

        <Descriptions.Item label="HST">
          ${(props.tax / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          $
          {((props.totalPriceBeforeTax + props.tax - props.totalMoney) / 100)
            .toFixed(2)
            .toString()}
        </Descriptions.Item>
      </Descriptions>

      <Tip />

      <div style={{ marginTop: "5%" }}>
        <h2>
          Total: ${(props.totalPriceAfterTax / 100).toFixed(2).toString()}
        </h2>
      </div>

      <div style={{ marginTop: "2%" }}>
        <Descriptions title="Point:">
          <Descriptions.Item label="Current points">
            {props.reward}
          </Descriptions.Item>
          <Descriptions.Item label="Estimated consumption points">
            {props.reward_out}
          </Descriptions.Item>
          <Descriptions.Item label="Expected to earn points">
            {props.reward_in}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
}

function Tip(props) {
  const inputEl = useRef(null);
  const [isModalVisible, setVisble] = useState(false);

  useEffect(() => {
    store.dispatch({
      type: "UPDATE_SELECT_TIP",
      selectTip: false,
    });
  }, []);

  function handle_tip_change(e) {
    store.dispatch({
      type: "UPDATE_SELECT_TIP",
      selectTip: true,
    });

    if (e.target.value != 999999) {
      store.dispatch({
        type: "MOD_OTHER_FEE",
        otherFee: Math.round(e.target.value),
      });

      store.dispatch({
        type: "MOD_TOTAL_PRICE",
        totalPrice: Math.round(
          props.orderInfo.totalPrice_noTip + e.target.value
        ),
      });
    } else {
      setVisble(true);
    }
  }

  function handle_custom_amount() {
    var result;

    if (
      isNaN(Number(inputEl.current.state.value)) == true ||
      Number(inputEl.current.state.value) < 0
    ) {
      result = 0;
    } else {
      result = Number(inputEl.current.state.value) * 100;
    }

    store.dispatch({
      type: "MOD_OTHER_FEE",
      otherFee: Math.round(result),
    });

    store.dispatch({
      type: "MOD_TOTAL_PRICE",
      totalPrice: Math.round(props.orderInfo.totalPrice_noTip + result),
    });

    setVisble(false);
  }

  return (
    <div>
      <div>
        <h3 style={{ marginTop: "2%", marginBottom: "2%" }}>
          Please select a tip: $
          {(props.orderInfo.otherFee / 100).toFixed(2).toString()}
        </h3>
        <Radio.Group buttonStyle="solid" onChange={handle_tip_change}>
          <Radio.Button value={0}>No Tip</Radio.Button>
          <Radio.Button value={props.orderInfo.totalPrice_noTip * 0.1}>
            10%($
            {((props.orderInfo.totalPrice_noTip / 100) * 0.1)
              .toFixed(2)
              .toString()}
            )
          </Radio.Button>
          <Radio.Button value={props.orderInfo.totalPrice_noTip * 0.15}>
            15%($
            {((props.orderInfo.totalPrice_noTip / 100) * 0.15)
              .toFixed(2)
              .toString()}
            )
          </Radio.Button>
          <Radio.Button value={props.orderInfo.totalPrice_noTip * 0.2}>
            20%($
            {((props.orderInfo.totalPrice_noTip / 100) * 0.2)
              .toFixed(2)
              .toString()}
            )
          </Radio.Button>
          <Radio.Button value={props.orderInfo.totalPrice_noTip * 0.25}>
            25%($
            {((props.orderInfo.totalPrice_noTip / 100) * 0.25)
              .toFixed(2)
              .toString()}
            )
          </Radio.Button>
          <Radio.Button value={999999}>Custom Amount</Radio.Button>
        </Radio.Group>
      </div>
      <Modal
        title="Tip"
        visible={isModalVisible}
        onOk={handle_custom_amount}
        width={400}
        closable={false}
        centered={true}
        cancelButtonProps={{ disabled: true }}
        maskClosable={false}
        okText="OK"
        cancelText="Cancel"
      >
        <Row>
          <Col span={20}>
            <Form.Item
              label="Custom Amount:"
              name="Amount"
              rules={[{ required: true, message: "Please input amount!" }]}
            >
              <Input
                style={{
                  borderTop: "0px",
                  borderLeft: "0px",
                  borderRight: "0px",
                }}
                ref={inputEl}
              />
            </Form.Item>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

const mapStateToProps_Tip = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
  };
};

Tip = connect(mapStateToProps_Tip)(Tip);

function PaymentMethod(props) {
  const [processing, setProcessing] = useState(false);
  const [isModalVisible, setVisible] = useState(false);
  const [isPageVisible, setPageVisible] = useState(false);
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  const [isTipVisible, setTipVisble] = useState(false);

  function handle_tip() {
    setTipVisble(false);
  }

  var ini_value = props.last4 == "" || props.last4 == undefined ? 2 : 1;
  const [value, setValue] = useState(ini_value);

  function handle_payment() {
    if (succeeded == true) {
      history.push("/home");
    } else {
      history.push("payment_2");
    }
    setVisible(false);
  }

  function handle_jump() {
    history.push("payment_4");
    setPageVisible(false);
  }

  function handle_normal_pay() {
    var paymentDetails;

    if (props.selectTip == false) {
      setTipVisble(true);
      return;
    }

    if (value == 2 && props.orderInfo.totalPrice > 0) {
      history.push("payment_2");
    } else if (value == 3 && props.orderInfo.totalPrice > 0) {
      history.push("payment_3");
    } else if (value == 4 && props.orderInfo.totalPrice > 0) {
      setPageVisible(true);
    } else if (value == 5 && props.orderInfo.totalPrice > 0) {
      setProcessing(true);
      paymentDetails = createPaymentDetail(props.orderInfo, props.userInfo);
      paymentDetails.orderNumber = props.orderNumber;
      api.afterPayment(paymentDetails).then((result) => {
        setProcessing(false);
        if (result.status == "afterPayment") {
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

          setMessage1(
            "下单成功，请记下您的订单号:" +
              props.orderNumber +
              " " +
              "若您是注册用户，订单接受后，会发邮件给您."
          );
          setMessage2(
            " The order is successful, please write down your order number:" +
              " " +
              props.orderNumber +
              " " +
              "if you are a registered user,after the order is received, an email will be sent to you "
          );
          setVisible(true);
        } else {
          setSucceeded(false);
          setMessage1("支付失败");
          setMessage2("Payment failed");
          setVisible(true);
        }
      });
    } else {
      //payment direct
      setProcessing(true);
      paymentDetails = createPaymentDetail(props.orderInfo, props.userInfo);
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

          setMessage1(
            "下单成功，请记下您的订单号:" +
              props.orderNumber +
              " " +
              "若您是注册用户，订单接受后，会发邮件给您."
          );
          setMessage2(
            " The order is successful, please write down your order number:" +
              " " +
              props.orderNumber +
              " " +
              "if you are a registered user,after the order is received, an email will be sent to you "
          );
          setVisible(true);
        } else {
          setSucceeded(false);
          setMessage1("支付失败");
          setMessage2("Payment failed");
          setVisible(true);
        }
      });
    }
  }

  function onChange(e) {
    setValue(e.target.value);
  }
  return (
    <div style={{ marginTop: "3%" }}>
      <Spin size="large" spinning={processing}>
        <div>
          <h2>Please choose a payment method:</h2>
          <Radio.Group
            onChange={onChange}
            defaultValue={props.last4 == "" || props.last4 == undefined ? 2 : 1}
          >
            <Space direction="vertical">
              {props.last4 != "" &&
                props.last4 != undefined &&
                props.last4 != null && (
                  <Radio
                    disabled={
                      props.last4 == "" ||
                      props.last4 == undefined ||
                      props.orderInfo.totalPrice < 0.01
                    }
                    value={1}
                  >
                    <h3>使用尾号为{props.last4}的信用卡付款</h3>
                    <h3> Pay with a credit card ending in {props.last4} </h3>
                  </Radio>
                )}

              <Radio value={2} disabled={props.orderInfo.totalPrice < 0.01}>
                <h3>使用新的信用卡付款</h3>
                <h3> Pay with a new credit card</h3>
              </Radio>
              <Space direction="horizontal">
                <Radio value={3} disabled={props.orderInfo.totalPrice < 0.01}>
                  <img src={wechat} style={{ width: "50%" }} />
                </Radio>

                <Radio value={4} disabled={false}>
                  <span>
                    <img src={alipay} style={{ width: "23%" }} />
                  </span>
                  <span>&nbsp;&nbsp;Coming soon....</span>
                </Radio>
              </Space>
              <Radio
                value={5}
                disabled={
                  props.orderInfo.totalPrice < 0.01 ||
                  props.userInfo.userCode.charAt(0) == "T"
                }
              >
                <h3>到店支付并提货</h3>
                <h3>Pay at the store and pick up the goods</h3>
              </Radio>
            </Space>
          </Radio.Group>
        </div>
        <Affix
          offsetBottom={15}
          style={{ marginLeft: "30%", marginTop: "10%" }}
        >
          <div style={{ width: "50%" }}>
            <Button
              type="primary"
              disabled={processing}
              onClick={handle_normal_pay}
              block={true}
              shape="round"
            >
              {value == 5 ? "Pay at Store" : "支付 Pay"}
            </Button>
          </div>
        </Affix>
        <Modal
          title="Message"
          visible={isModalVisible}
          onOk={handle_payment}
          width={400}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          <p>{message1}</p>
          <p>{message2}</p>
        </Modal>
        <Modal
          title="支付宝支付"
          visible={isPageVisible}
          onOk={handle_jump}
          width={400}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
        >
          即将跳到支付页面，跳转需要几秒时间，请耐心等待！
        </Modal>
        <Modal
          title="Message"
          visible={isTipVisible}
          onOk={handle_tip}
          width={400}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          <p>需要选择小费</p>
          <p>Need to choose a tip</p>
        </Modal>
      </Spin>
    </div>
  );
}

const mapStateToProps_PaymentMethod = (state) => {
  return {
    selectTip: state.actionReducer.selectTip,
  };
};

PaymentMethod = connect(mapStateToProps_PaymentMethod)(PaymentMethod);

///////////////////////////////////
export function createPaymentDetail(orderInfo, userInfo) {
  var paymentDetail = new Object();

  paymentDetail.userCode = userInfo.userCode;
  paymentDetail.email = userInfo.email;

  paymentDetail.otherFee = orderInfo.otherFee;

  paymentDetail.shopAddress = userInfo.shopAddress;

  paymentDetail.product = [];
  for (var i = 0; i < orderInfo.orderProduct.length; i++) {
    paymentDetail.product.push(orderInfo.orderProduct[i]);
  }

  if (
    orderInfo.total_cup != undefined &&
    orderInfo.total_cup != "" &&
    orderInfo.total_cup != null
  ) {
    paymentDetail.total_cup = orderInfo.total_cup;
  } else {
    paymentDetail.total_cup = 0;
  }

  if (
    orderInfo.reward_out != undefined &&
    orderInfo.reward_out != "" &&
    orderInfo.reward_out != null
  ) {
    paymentDetail.reward_out = orderInfo.reward_out;
  } else {
    paymentDetail.reward_out = 0;
  }

  return paymentDetail;
}

import { Helmet } from "react-helmet";

export function BillInfo(props) {
  const [billInfo, setBillInfo] = useState({});
  const [spinning, setSpinning] = useState(false);

  function handle_home() {
    var inputObj = new Object();
    inputObj.orderNumber = props.orderInfo.orderNumber;

    api.deleteUnPayment(inputObj).then((result) => {
      history.push("/home");
    });
  }

  function handle_cart() {
    var inputObj = new Object();
    inputObj.orderNumber = props.orderInfo.orderNumber;

    api.deleteUnPayment(inputObj).then((result) => {
      history.push("/cart");
    });
  }

  useEffect(() => {
    //forbidden back
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });

    // Step 1:get bill info and display to customer to confirm
    setSpinning(true);
    console.log("get bill info");

    console.log("in BillInfo_1 ");
    console.log(props.orderInfo);

    api
      .getBillInfo(createPaymentDetail(props.orderInfo, props.userInfo))
      .then((result) => {
        setSpinning(false);
        setBillInfo(result);
        console.log(result);
        console.log(" bill info ok");
        store.dispatch({
          type: "MOD_TOTAL_PRICE",
          totalPrice: result.TotalPrice.totalPriceAfterTax,
        });

        store.dispatch({
          type: "MOD_TOTAL_PRICE_NOTIP",
          totalPrice_noTip: result.TotalPrice.totalPriceAfterTax,
        });

        store.dispatch({
          type: "MOD_ORDER_NUMBER",
          orderNumber: result.orderNumber,
        });
      });
  }, []);

  if (billInfo.TotalPrice != undefined) {
    return (
      <Spin spinning={spinning}>
        <Helmet>
          <title>World tea payment</title>
          <meta
            name="description"
            content="世界茶饮付款支持信用卡,支付宝,微信,支持到店付款"
          />
        </Helmet>
        <div style={{ height: "100%" }}>
          <Affix offsetTop={5}>
            <div
              style={{
                zIndex: "10",
              }}
            >
              <Row>
                <Col xs={4} style={{ marginLeft: "5%", marginRight: "60%" }}>
                  <div>
                    <a onClick={handle_home}>
                      <img src={home} style={{ width: "32px" }}></img>
                    </a>
                  </div>
                </Col>

                <Col xs={4}>
                  <div>
                    <a onClick={handle_cart}>
                      <img src={cart} style={{ width: "32px" }}></img>
                    </a>
                  </div>
                </Col>
              </Row>
            </div>
          </Affix>
          <div style={{ marginTop: "0%", marginLeft: "10%", height: "100%" }}>
            <UserInfo
              orderNumber={billInfo.orderNumber}
              nickName={props.userInfo.nickName}
              email={props.userInfo.email}
              phone={props.userInfo.phone}
              shopAddress={props.userInfo.shopAddress}
            />
            <div style={{ marginTop: "2%" }}>
              <h3>Details：</h3>
              <OrderList subPrice={billInfo.subPrice} />
            </div>

            <TotalPrice
              totalPriceBeforeTax={billInfo.TotalPrice.totalPriceBeforeTax}
              reward_in={billInfo.TotalPrice.reward_in}
              reward_out={billInfo.TotalPrice.reward_out}
              totalMoney={billInfo.TotalPrice.reward_totalMoney}
              reward={props.userInfo.reward}
              shipFee={billInfo.TotalPrice.shipFee}
              otherFee={billInfo.TotalPrice.otherFee}
              taxRate={billInfo.TotalPrice.taxRate}
              tax={billInfo.TotalPrice.tax}
              totalPriceAfterTax={props.orderInfo.totalPrice}
            />

            <Divider />

            <PaymentMethod
              last4={billInfo.last4}
              orderNumber={billInfo.orderNumber}
              orderInfo={props.orderInfo}
              userInfo={props.userInfo}
            />
          </div>
        </div>
      </Spin>
    );
  } else
    return (
      <Spin spinning={spinning}>
        <div>Please Wait。。。</div>
      </Spin>
    );
}

const mapStateToProps_BillInfo = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
    userInfo: state.userInfoReducer,
  };
};

BillInfo = connect(mapStateToProps_BillInfo)(BillInfo);
