import React, { useEffect, useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { Row, Col, Input, Select } from "antd";

import CheckoutForm from "./CheckoutForm";

import api from "../api";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));

import home from "../../images/home.svg";

export default function NormalPay_form(props) {
  useEffect(() => {
    //forbidden back
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });
    // Step 1:get bill info and display to customer to confirm
  }, []);

  function handle_home() {
    var inputObj = new Object();
    console.log(props.orderInfo.orderNumber);
    inputObj.orderNumber = props.orderInfo.orderNumber;

    api.deleteUnPayment(inputObj).then((result) => {
      history.push("/home");
    });
  }
  return (
    <div>
      <div>
        <a onClick={handle_home} style={{ marginLeft: "5%" }}>
          <img src={home} style={{ width: "32px" }}></img>
        </a>
      </div>
      <div style={{ marginLeft: "15%" }}>
        <Elements stripe={stripePromise}>
          <UserInfo_pay />
          <CheckoutForm />
        </Elements>
      </div>
      <div style={{ height: "200px" }}></div>
    </div>
  );
}

const mapStateToProps_NormalPay_form = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
  };
};

NormalPay_form = connect(mapStateToProps_NormalPay_form)(NormalPay_form);

function UserInfo_pay(props) {
  function handle_firstName(e) {
    store.dispatch({
      type: "UPDATE_FIRSTNAME",
      payload: e.target.value,
    });
  }

  function handle_lastName(e) {
    store.dispatch({
      type: "UPDATE_LASTNAME",
      payload: e.target.value,
    });
  }

  function handle_address(e) {
    store.dispatch({
      type: "UPDATE_ADDRESS",
      payload: e.target.value,
    });
  }

  function handle_province(e) {
    store.dispatch({
      type: "UPDATE_PROVINCE",
      payload: e,
    });
  }

  function handle_city(e) {
    store.dispatch({
      type: "UPDATE_CITY",
      payload: e.target.value,
    });
  }

  function handle_postalCode(e) {
    store.dispatch({
      type: "UPDATE_POSTALCODE",
      payload: e.target.value,
    });
  }
  return (
    <div>
      <div style={{ marginBottom: "1%" }}>
        <h3>
          You need to pay&nbsp;$
          {(props.orderInfo.totalPrice / 100).toFixed(2).toString()}
        </h3>
      </div>
      <div style={{ marginBottom: "1%" }}>
        <h3>User info：</h3>
      </div>
      <Row>
        <Col xs={4}>
          <Input
            placeholder="Last Name"
            onChange={handle_lastName}
            style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          />
        </Col>

        <Col style={{ marginLeft: "2%" }} xs={4}>
          <Input
            placeholder="First Name"
            onChange={handle_firstName}
            style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: "2%" }}>
        <Col xs={10}>
          <Input
            placeholder="Address"
            onChange={handle_address}
            style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: "2%" }}>
        <Col xs={6}>
          <Input
            placeholder="City"
            onChange={handle_city}
            style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          />
        </Col>

        <Col style={{ marginLeft: "2%" }} xs={6}>
          <Input
            placeholder="Postcode"
            onChange={handle_postalCode}
            style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          />
        </Col>

        <Col xs={4}>
          <Select
            style={{
              width: 100,
              borderTop: "0px",
              borderLeft: "0px",
              borderRight: "0px",
            }}
            onChange={handle_province}
          >
            <Option value="ON">ON</Option>
            <Option value="BC">BC</Option>
          </Select>
        </Col>
      </Row>
    </div>
  );
}

const mapStateToProps_UserInfo_pay = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
  };
};

UserInfo_pay = connect(mapStateToProps_UserInfo_pay)(UserInfo_pay);
