import React from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { Row, Col, Input, Select } from "antd";

import CheckoutForm from "./CheckoutForm";

import api from "../api";

//redux
import { store } from "../app";

import { connect } from "react-redux";

const stripePromise = api.getPublicStripeKey().then((key) => loadStripe(key));

export default function NormalPay_form() {
  return (
    <div style={{ marginTop: "5%", marginLeft: "15%" }}>
      <Elements stripe={stripePromise}>
        <UserInfo_pay />
        <CheckoutForm />
      </Elements>
    </div>
  );
}

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
          您本次需要支付${(props.orderInfo.totalPrice / 100).toString()}元:
        </h3>
      </div>
      <div style={{ marginBottom: "1%" }}>
        <h3>用户信息：</h3>
      </div>
      <Row>
        <Col xs={4}>
          <Input placeholder="姓" onChange={handle_lastName} />
        </Col>

        <Col style={{ marginLeft: "2%" }} xs={4}>
          <Input placeholder="名" onChange={handle_firstName} />
        </Col>
      </Row>
      <Row style={{ marginTop: "2%" }}>
        <Col xs={10}>
          <Input placeholder="地址" onChange={handle_address} />
        </Col>
      </Row>
      <Row style={{ marginTop: "2%" }}>
        <Col xs={6}>
          <Input placeholder="城市" onChange={handle_city} />
        </Col>

        <Col style={{ marginLeft: "2%" }} xs={6}>
          <Input placeholder="邮编" onChange={handle_postalCode} />
        </Col>

        <Col xs={4}>
          <Select style={{ width: 100 }} onChange={handle_province}>
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
