import React, { useEffect, useState } from "react";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";
import { Descriptions, List, Radio, Modal, Affix, Spin, Space } from "antd";

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
      <h3>Order Info:</h3>
      <Descriptions title="User Info:">
        <Descriptions.Item label="Order Number">
          {props.orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="NickName">{props.nickName}</Descriptions.Item>
        <Descriptions.Item label="EMAIL">{props.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{props.phone}</Descriptions.Item>
        <Descriptions.Item label="Address">
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
      "," +
      subPrice[i].productIntro +
      "," +
      "      Unit price:$" +
      (subPrice[i].price / 100).toFixed(2).toString() +
      "," +
      "      Quantity:" +
      subPrice[i].amount +
      "," +
      "    Total price(includes small materials):$" +
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
      <Descriptions title="Order summary:">
        <Descriptions.Item label="Pre-tax price">
          ${(props.totalPriceBeforeTax / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Use points to deduct the price">
          ${(props.totalMoney / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Transportation fee">
          {(props.shipFee / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Other fee">
          {(props.otherFee / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tax rate">{props.taxRate}</Descriptions.Item>
        <Descriptions.Item label="Taxes">
          {" "}
          {(props.tax / 100).toFixed(2).toString()}
        </Descriptions.Item>
      </Descriptions>

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

      <div style={{ marginTop: "2%" }}>
        <h2>
          Total price after tax: $
          {(props.totalPriceAfterTax / 100).toFixed(2).toString()}
        </h2>
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
  const [isPageVisible, setPageVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [succeeded, setSucceeded] = useState(false);

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

          setMessage(
            "下单成功，请记下您的订单号:" +
              props.orderNumber +
              " 订单接受后，会发邮件给您." +
              " The order is successful, please write down your order number:" +
              props.orderNumber +
              " After the order is received, an email will be sent to you "
          );
          setVisible(true);
        } else {
          setSucceeded(false);
          setMessage("支付失败 Payment failed!");
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

          setMessage(
            "下单成功，请记下您的订单号" +
              props.orderNumber +
              "订单接受后，会发邮件给您" +
              " The order is successful, please write down your order number:" +
              props.orderNumber +
              "After the order is received, an email will be sent to you "
          );
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
      <Spin size="large" spinning={processing}>
        <div>
          <h3>Please choose a payment method:</h3>
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
              使用尾号为{props.last4}的信用卡付款 Pay with a credit card ending
              in {props.last4}
            </Radio>
            <Radio
              style={radioStyle}
              value={2}
              disabled={props.orderInfo.totalPrice < 0.01}
            >
              使用新的信用卡付款 Pay with a new credit card
            </Radio>
            <Space direction="horizontal">
              <Radio value={3} disabled={props.orderInfo.totalPrice < 0.01}>
                <img src={wechat} style={{ width: "50%" }} />
              </Radio>

              <Radio value={4} disabled={props.orderInfo.totalPrice < 0.01}>
                <img src={alipay} style={{ width: "45%" }} />
              </Radio>
            </Space>
            <Radio
              style={radioStyle}
              value={5}
              disabled={
                props.orderInfo.totalPrice < 0.01 ||
                props.userInfo.userCode.charAt(0) == "T"
              }
            >
              到店支付并提货 Pay at the store and pick up the goods
            </Radio>
          </Radio.Group>
        </div>
        <Affix offsetBottom={5} style={{ marginLeft: "30%", marginTop: "10%" }}>
          <div style={{ width: "40%" }}>
            <Button
              type="primary"
              disabled={processing}
              onClick={handle_normal_pay}
              block={true}
              shape="round"
            >
              {value == 5 ? "到店支付 Pay at the Store" : "支付 Pay"}
            </Button>
          </div>
        </Affix>
        <Modal
          title="Message"
          visible={isModalVisible}
          onOk={handle_payment}
          width={300}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          {message}
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
      </Spin>
    </div>
  );
}

///////////////////////////////////
export function createPaymentDetail(orderInfo, userInfo) {
  var paymentDetail = new Object();

  paymentDetail.userCode = userInfo.userCode;
  paymentDetail.email = userInfo.email;
  paymentDetail.otherFee = 0; //for test

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
    api
      .getBillInfo(createPaymentDetail(props.orderInfo, props.userInfo))
      .then((result) => {
        setSpinning(false);
        setBillInfo(result);
        console.log(" bill info ok");
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
      <Spin spinning={spinning}>
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
              <h3>Purchase details：</h3>
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
              totalPriceAfterTax={billInfo.TotalPrice.totalPriceAfterTax}
            />
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
