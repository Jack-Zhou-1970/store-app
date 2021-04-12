import React, { useEffect, useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import api from "../api";

import { Button, Modal } from "antd";
import { Row, Col } from "antd";

import history from "../history";

import "regenerator-runtime/runtime";

import { createPaymentDetail } from "./component_directpay";

import { connect } from "react-redux";
import { store } from "../app";

//test data

export default function CheckoutForm(props) {
  const [clientSecret, setClientSecret] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [isModalVisible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const [error, setError] = useState(null);
  const [paymentDetails, setPayment] = useState(
    createPaymentDetail(props.orderInfo.orderProduct, props.userInfo)
  );

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  function handle_home() {
    history.push("/home");
  }

  function handle_cart() {
    history.push("/cart");
  }

  function handle_payment() {
    if (succeeded == true) {
      history.push("/home");
    }
    setVisible(false);
  }

  useEffect(() => {
    var payment_o = {
      ...paymentDetails,
      orderNumber: props.orderInfo.orderNumber,
    };

    setPayment(payment_o);

    api
      .createPaymentIntent(payment_o)
      .then((data) => {
        setClientSecret(data.client_secret);
        setCustomerId(data.customer);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const handleSubmit = async () => {
    setProcessing(true);

    // Step 3: Use clientSecret from PaymentIntent and the CardElement
    // to confirm payment with stripe.confirmCardPayment()
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: props.userInfo.firstName + " " + props.userInfo.lastName,
        },
      },
    });

    var payment = new Object();

    if (payload.error) {
      console.log("支付失败");
      console.log(payload.error.message);
      setError(payload.error.message);
      setProcessing(false);
      setSucceeded(false);

      payment = {
        ...paymentDetails,

        customerId: customerId,
        status: "fail",
      };
    } else {
      console.log("支付成功");

      setError(null);
      setSucceeded(true);
      setProcessing(false);

      payment = {
        ...paymentDetails,
        paymentInstend: payload.paymentIntent.id,
        customerId: customerId,
        status: "success",
      };
    }

    payment.lastName = props.userInfo.lastName;
    payment.firstName = props.userInfo.firstName;
    payment.province = props.userInfo.province;
    payment.city = props.userInfo.city;
    payment.address = props.userInfo.address;
    payment.postalCode = props.userInfo.postalCode;

    //send status to server

    api.setPayment(payment).then((result) => {
      if (result.status == "requireCapture") {
        //clean shoppingCart
        store.dispatch({
          type: "DEL_ALL_ORDER_PRODUCT",
        });

        setMessage("支付成功，请记下您的订单号" + props.orderInfo.orderNumber);
        setVisible(true);
      } else {
        setMessage("支付失败! " + payload.error.message);
        setVisible(true);
      }
    });
  };

  const renderForm = () => {
    const options = {
      style: {
        base: {
          color: "#32325d",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      },
    };

    return (
      <div style={{ marginTop: "4%" }}>
        <h3>信用卡信息：</h3>

        <div
          style={{
            border: "1px solid #bdb6b6",
            width: "40%",
            marginTop: "2%",
          }}
        >
          <CardNumberElement options={options} />
        </div>

        <div
          style={{
            border: "1px solid #bdb6b6",
            width: "40%",
            marginTop: "2%",
          }}
        >
          <CardExpiryElement options={options} />
        </div>

        <div
          style={{
            border: "1px solid #bdb6b6",
            width: "40%",
            marginTop: "2%",
          }}
        >
          <CardCvcElement options={options} />
        </div>

        <Row style={{ marginTop: "4%" }}>
          <Col xs={10}>
            <Button
              disabled={processing || !clientSecret || !stripe}
              onClick={handleSubmit}
              style={{
                backgroundColor: "#bd148a",
                color: "white",
              }}
            >
              {processing ? "支付中…" : "支付"}
            </Button>
          </Col>
          <Col xs={6}>
            <Button onClick={handle_home}>继续选购</Button>
          </Col>
          <Col xs={6}>
            <Button onClick={handle_cart}>回购物车</Button>
          </Col>
        </Row>
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
  };

  return <div>{renderForm()}</div>;
}

const mapStateToProps_CheckoutForm = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
    userInfo: state.userInfoReducer,
  };
};

CheckoutForm = connect(mapStateToProps_CheckoutForm)(CheckoutForm);
