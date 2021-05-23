import React, { useEffect, useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import api from "../api";

import { Button, Modal, Spin } from "antd";
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
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");

  const [error, setError] = useState(null);
  const [paymentDetails, setPayment] = useState(
    createPaymentDetail(props.orderInfo, props.userInfo)
  );

  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

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

        //update reward info
        store.dispatch({
          type: "UPDATE_REWARD",
          payload: result.reward,
        });

        setMessage1(
          "下单成功，请记下您的订单号:" +
            props.orderInfo.orderNumber +
            " " +
            "若您是注册用户，订单接受后，会发邮件给您."
        );
        setMessage2(
          " The order is successful, please write down your order number:" +
            " " +
            props.orderInfo.orderNumber +
            " " +
            "if you are a registered user,after the order is received, an email will be sent to you "
        );
        setVisible(true);
      } else {
        setMessage1("支付失败 Payment failed! " + payload.error.message);
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
        <Spin size="large" spinning={processing}>
          <h3>信用卡信息：</h3>

          <div
            style={{
              border: "1px solid #bdb6b6",
              borderTop: "0px",
              borderLeft: "0px",
              borderRight: "0px",
              width: "60%",
              height: "100%",
              marginTop: "2%",
            }}
          >
            <CardNumberElement options={options} />
          </div>

          <div
            style={{
              border: "1px solid #bdb6b6",
              borderTop: "0px",
              borderLeft: "0px",
              borderRight: "0px",
              width: "60%",
              marginTop: "2%",
            }}
          >
            <CardExpiryElement options={options} />
          </div>

          <div
            style={{
              border: "1px solid #bdb6b6",
              borderTop: "0px",
              borderLeft: "0px",
              borderRight: "0px",
              width: "60%",
              marginTop: "2%",
            }}
          >
            <CardCvcElement options={options} />
          </div>

          <div style={{ marginTop: "8%", marginLeft: "10%", width: "40%" }}>
            <Button
              disabled={processing || !clientSecret || !stripe}
              type="primary"
              onClick={handleSubmit}
              block={true}
              shape="round"
            >
              {processing ? "支付中 processing..." : "支付 Pay "}
            </Button>
          </div>
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
        </Spin>
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
