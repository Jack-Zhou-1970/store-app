import React from "react";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";

import { Card } from "antd";

import "antd/dist/antd.css";

import history from "../history";

//test data
import { loginInfo, paymentDetails, orderInfoIni } from "../public_data";

//redux
import { store } from "../app";
import { object } from "prop-types";

function SmallProduct(props) {
  return (
    <p>
      {props.productName} 数量:{props.amount}
    </p>
  );
}

function ProductList(props) {
  return (
    <div className="site-card-border-less-wrapper">
      <Card
        size="small"
        title={props.mainProductNameAndAmount}
        bordered={false}
        style={{ width: 300 }}
      >
        {props.children}
      </Card>
    </div>
  );
}

function ButtonGroup(props) {
  return (
    <Col>
      <Button className="gutter-row" onClick={props.handle_click}>
        {props.name}
      </Button>
    </Col>
  );
}

class ProductList_manage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderProduct: [],
    };

    this.handle_add_click = this.handle_add_click.bind(this);
    this.handle_delete_click = this.handle_delete_click.bind(this);
  }

  componentDidMount() {
    this.setState({ orderProduct: store.getState() });
  }

  handle_add_click() {
    store.dispatch({
      type: "ADD_ORDER_PRODUCT",
      productList: { mainProductName: "坚果奶茶", amount: 1, smallProduct: [] },
    });
    this.setState({ orderProduct: store.getState() });
  }

  handle_delete_click() {}

  render() {
    var mainProductList = [];
    var smallProductList = [];

    mainProductList = this.state.orderProduct.map((item, index) => {
      smallProductList = item.smallProduct.map((item1, index1) => {
        return (
          <SmallProduct
            key={item1.productName}
            productName={item1.productName}
            amount={item1.amount}
          />
        );
      }); //smallProductList;

      var string = item.mainProductName + " 数量:" + item.amount;

      return (
        <ProductList key={string} mainProductNameAndAmount={string}>
          {smallProductList}
        </ProductList>
      );
    }); //mainProductList;

    return (
      <div>
        <Row justify="center" style={{ marginBottom: "5%" }}>
          <Col>{mainProductList}</Col>
        </Row>
        <Row justify="center" gutter={16} style={{ marginBottom: "5%" }}>
          <ButtonGroup name={"add"} handle_click={this.handle_add_click} />

          <ButtonGroup name={"del"} handle_click={this.handle_delete_click} />
        </Row>
      </div>
    );
  }
}

/* */
//////////////////////////////////////////////////////////////////////////
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
      <Row justify="center" style={{ marginBottom: "5%" }}>
        <Button type="dashed" onClick={props.handle_normal_pay}>
          Normal pay
        </Button>
      </Row>
      <ProductList_manage />
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
