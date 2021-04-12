import React from "react";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { Row, Col, Input, Select } from "antd";

import CheckoutForm from "./CheckoutForm";

import api from "../api";

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
          <Input placeholder="输入姓" />
        </Col>

        <Col style={{ marginLeft: "2%" }} xs={4}>
          <Input placeholder="输入名" />
        </Col>
      </Row>
      <Row style={{ marginTop: "1%" }}>
        <Col xs={10}>
          <Input placeholder="输入地址" />
        </Col>
      </Row>
      <Row style={{ marginTop: "1%" }}>
        <Col xs={4}>
          <Select defaultValue="ON" style={{ width: 100 }}>
            <Option value="ON">ON</Option>
            <Option value="BC">BC</Option>
          </Select>
        </Col>

        <Col xs={4}>
          <Input placeholder="输入城市" />
        </Col>

        <Col style={{ marginLeft: "2%" }} xs={4}>
          <Input placeholder="输入邮编" />
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
