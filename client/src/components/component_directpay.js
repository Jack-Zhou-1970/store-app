import React from "react";

const bootstrap = require("bootstrap");

import "../bootstrap/css/bootstrap.min.css";

import api from "../api";

import history from "../history";

function Direct_payform(props) {
  function Directpay_btn() {
    return (
      <button
        className="btn btn-primary"
        type="button"
        onClick={props.handle_direct_pay}
      >
        Direct pay
      </button>
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
    this.state = { enable_direct_pay: false };
    this.handle_normal_pay = this.handle_normal_pay.bind(this);
    this.handle_direct_pay = this.handle_direct_pay.bind(this);
  }

  componentDidMount() {
    api.getCardLast4("1234").then((cardlast4) => {
      if (cardlast4 == "") {
        this.setState({ enable: false });
      } else {
        this.setState({ enable: true });
      }
    });
  }

  handle_normal_pay() {
    history.push("/normal-pay");
  }

  handle_direct_pay() {
    api.direct_pay().then((result) => {
      console.log(result);
    });
  }

  render() {
    return (
      <Direct_payform
        enable={this.state.enable}
        handle_normal_pay={this.handle_normal_pay}
        handle_direct_pay={this.handle_direct_pay}
      />
    );
  }
}
