import React from "react";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";
import { Descriptions, Badge } from "antd";
import "antd/dist/antd.css";

import history from "../history";

//test data
import { loginInfo, paymentDetails } from "../public_data";

function Details(props) {
  return (
    <Descriptions title="User Info" bordered>
      <Descriptions.Item label="Product">Cloud Database</Descriptions.Item>
      <Descriptions.Item label="Billing Mode">Prepaid</Descriptions.Item>
      <Descriptions.Item label="Automatic Renewal">YES</Descriptions.Item>
      <Descriptions.Item label="Order time">
        2018-04-24 18:00:00
      </Descriptions.Item>
      <Descriptions.Item label="Usage Time" span={2}>
        2019-04-24 18:00:00
      </Descriptions.Item>
      <Descriptions.Item label="Status" span={3}>
        <Badge status="processing" text="Running" />
      </Descriptions.Item>
      <Descriptions.Item label="Negotiated Amount">$80.00</Descriptions.Item>
      <Descriptions.Item label="Discount">$20.00</Descriptions.Item>
      <Descriptions.Item label="Official Receipts">$60.00</Descriptions.Item>
    </Descriptions>
  );
}

function Direct_payform(props) {
  function Directpay_btn() {
    return (
      <div>
        <Row justify="center">
          use card {props.cardNum}to pay {props.totalPrice}
        </Row>
        <Row justify="center">
          <Button type="button" onClick={props.handle_direct_pay}>
            Direct pay
          </Button>
        </Row>
      </div>
    );
  }

  return (
    <div>
      {props.enable && Directpay_btn()}
      <Row justify="center">
        <Button type="dashed" onClick={props.handle_normal_pay}>
          Normal pay
        </Button>
      </Row>
      <Details />
    </div>
  );
}

export class Direct_payform_manage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enable: false,
      billInfo: { last4: "", TotalPrice: { totalPriceAfterTax: 0 } },
    };
    this.handle_normal_pay = this.handle_normal_pay.bind(this);
    this.handle_direct_pay = this.handle_direct_pay.bind(this);
  }

  componentDidMount() {
    api.getUserInfo(loginInfo).then((result) => {
      if (result.last4 == "") {
        this.setState({ enable: false });
      } else {
        api.getBillInfo(paymentDetails).then((result) => {
          this.setState({ billInfo: result });
        });
        this.setState({ enable: true });
      }
    });
  }

  handle_normal_pay() {
    history.push("/normal-pay");
  }

  handle_direct_pay() {
    paymentDetails.orderNumber = this.state.billInfo.orderNumber;

    api.direct_pay(paymentDetails).then((result) => {});
  }

  render() {
    return (
      <Direct_payform
        enable={this.state.enable}
        cardNum={this.state.billInfo.last4}
        totalPrice={this.state.billInfo.TotalPrice.totalPriceAfterTax}
        handle_normal_pay={this.handle_normal_pay}
        handle_direct_pay={this.handle_direct_pay}
      />
    );
  }
}
