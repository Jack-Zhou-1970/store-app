import React from "react";

const bootstrap = require("bootstrap");

import "../bootstrap/css/bootstrap.min.css";

import api from "../api";

import history from "../history";

//test data
import { loginInfo, paymentDetails } from "../public_data";

function Direct_payform(props) {
  function Directpay_btn() {
    return (
      <div>
        <h3>
          use card {props.cardNum}to pay {props.totalPrice}
        </h3>
        <button
          className="btn btn-primary"
          type="button"
          onClick={props.handle_direct_pay}
        >
          Direct pay
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <div className="d-grid gap-2 col-6 mx-auto">
        {props.enable && Directpay_btn()}

        <button
          className="btn btn-primary"
          type="button"
          onClick={props.handle_normal_pay}
        >
          Normal pay
        </button>
      </div>
    </div>
  );
}

export class Direct_payform_manage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enable_direct_pay: false,
      billInfo: { last4: "", TotalPrice: { totalPriceAfterTax: 0 } },
    };
    this.handle_normal_pay = this.handle_normal_pay.bind(this);
    this.handle_direct_pay = this.handle_direct_pay.bind(this);
  }

  componentDidMount() {
    api.getUserInfo(loginInfo).then((result) => {
      console.log("print last4");
      console.log(result);

      if (result.last4 == "") {
        this.setState({ enable: false });
      } else {
        this.setState({ enable: true });
      }
    });

    api.getBillInfo(paymentDetails).then((result) => {
      this.setState({ billInfo: result });
    });
  }

  handle_normal_pay() {
    history.push("/normal-pay");
  }

  handle_direct_pay() {
    api.direct_pay(paymentDetails).then((result) => {
      console.log("print direct pay result");
      console.log(result);
    });
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
