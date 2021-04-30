import React, { useEffect, useState } from "react";

//stripe
import { useStripe } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import api from "../api";

import { Button, Modal, Spin } from "antd";
import { Row, Col } from "antd";

import history from "../history";

import "regenerator-runtime/runtime";

import { createPaymentDetail } from "./component_directpay";

import { connect } from "react-redux";
import { store } from "../app";

import QRCode from "qrcode.react";

const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));

function WeChatPay(props) {
  const [isQRVisble, setQRVisble] = useState(false);
  const [isModalVisible, setVisible] = useState(false);
  const [url, setUrl] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentDetails, setPayment] = useState(
    createPaymentDetail(props.orderInfo, props.userInfo)
  );

  const stripe = useStripe();

  var source, timer;

  function handle_payment() {
    if (succeeded == true) {
      history.push("/home");
    } else {
      history.push("/payment_1");
    }
    setVisible(false);
  }

  function handleBack() {
    clearInterval(timer);
    history.push("/payment_1");
  }

  useEffect(() => {
    //forbidden back
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });

    var count = 0;

    if (stripe != null) {
      source = stripe
        .createSource({
          type: "wechat",
          amount: props.orderInfo.totalPrice,
          currency: "cad",
        })
        .then((result) => {
          setUrl(result.source.wechat.qr_code_url);
          setQRVisble(true);
          timer = setInterval(() => {
            count++;
            if (count > 180) {
              clearInterval(timer);
              setMessage("支付超时");
              setVisible(true);
            }
            stripe
              .retrieveSource({
                id: result.source.id,
                client_secret: result.source.client_secret,
              })
              .then((result) => {
                var source = result.source;
                if (source.status === "chargeable") {
                  clearInterval(timer);
                  var payment_o = {
                    ...paymentDetails,
                    orderNumber: props.orderInfo.orderNumber,
                    source: source.id,
                  };
                  setPayment(payment_o);
                  api.weChatPay(payment_o).then((result) => {
                    if (result.status == "success") {
                      setSucceeded(true);
                      store.dispatch({
                        type: "DEL_ALL_ORDER_PRODUCT",
                      });

                      //update reward info
                      store.dispatch({
                        type: "UPDATE_REWARD",
                        payload: result.reward,
                      });

                      setMessage(
                        "支付成功，请记下您的订单号" +
                          props.orderInfo.orderNumber +
                          "订单接受后，会发邮件给您"
                      );
                      setVisible(true);
                    } else {
                      setMessage("支付失败!，请更换支付方式");
                      setVisible(true);
                    }
                  });
                }
              });
          }, 1000);
        });
    }
  }, [stripe]);

  return (
    <div
      style={{
        marginTop: "20%",
        marginLeft: "25%",
        display: isQRVisble ? "block" : "none",
      }}
    >
      <h2>请用手机微信扫描下面二维码，并在三分钟内完成支付</h2>
      <div style={{ marginLeft: "5%" }}>
        <QRCode value={url} size={150} fgColor="#000000" />
      </div>
      <div style={{ marginTop: "8%", marginLeft: "3%", width: "40%" }}>
        <Button type="primary" onClick={handleBack} block={true} shape="round">
          返回上一级
        </Button>
      </div>
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

const mapStateToProps_WeChatPay = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
    userInfo: state.userInfoReducer,
  };
};

WeChatPay = connect(mapStateToProps_WeChatPay)(WeChatPay);

export function WeChatPay_manage() {
  return (
    <Elements stripe={stripePromise}>
      <WeChatPay />
    </Elements>
  );
}
