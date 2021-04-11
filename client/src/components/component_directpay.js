import React, { useEffect, useState } from "react";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";
import { Descriptions, List, Radio } from "antd";

import "antd/dist/antd.css";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

function UserInfo(props) {
  return (
    <div style={{ marginTop: "2%" }}>
      <h3>下面是您本次订购的订单信息:</h3>
      <Descriptions title="用户信息:">
        <Descriptions.Item label="订单号">
          {props.orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="昵称">{props.nickName}</Descriptions.Item>
        <Descriptions.Item label="EMAIL">{props.email}</Descriptions.Item>
        <Descriptions.Item label="电话">{props.phone}</Descriptions.Item>
        <Descriptions.Item label="店铺地址">
          {props.shopAddress}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

function createData(subPrice) {
  var dataArray = [];

  if (subPrice == undefined) {
    return dataArray;
  }

  for (var i = 0; i < subPrice.length; i++) {
    var data = new Object();
    data.mainProduct =
      subPrice[i].mainProductName +
      "      单价:$" +
      (subPrice[i].price / 100).toString() +
      "      数量:" +
      subPrice[i].amount +
      "    总价(含加料):$" +
      (subPrice[i].totalPrice / 100).toString();
    data.smallProduct = "";
    for (var j = 0; j < subPrice[i].smallProduct.length; j++) {
      var amount =
        subPrice[i].smallProduct[j].price > 0
          ? "*" + subPrice[i].smallProduct[j].amount
          : "";
      data.smallProduct =
        data.smallProduct +
        subPrice[i].smallProduct[j].productName +
        amount +
        "         ";
    }
    dataArray.push(data);
  }

  return dataArray;
}

function OrderList(props) {
  console.log("in  OrderList");
  console.log(props.subPrice);
  const data = createData(props.subPrice);
  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={item.mainProduct}
            description={item.smallProduct}
          />
        </List.Item>
      )}
    />
  );
}

function TotalPrice(props) {
  return (
    <div style={{ marginTop: "2%" }}>
      <Descriptions title="订单汇总:">
        <Descriptions.Item label="税前价格:$">
          {(props.totalPriceBeforeTax / 100).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="运输费用">
          {(props.shipFee / 100).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="其它费用">
          {(props.otherFee / 100).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="税率">{props.taxRate}</Descriptions.Item>
        <Descriptions.Item label="税费">
          {" "}
          {(props.tax / 100).toFixed(2).toString()}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: "2%" }}>
        <h2>税后总价: ${(props.totalPriceAfterTax / 100).toString()}</h2>
      </div>
    </div>
  );
}

function PaymentMethod(props) {
  const radioStyle = {
    display: "block",
    height: "30px",
    lineHeight: "30px",
  };

  function handle_home() {
    history.push("/home");
  }

  function handle_cart() {
    history.push("/cart");
  }

  function handle_normal_pay() {
    history.push("payment_2");
  }

  function onChange(value) {}
  return (
    <Row style={{ marginTop: "5%" }}>
      <Col xs={6}>
        <h3>请选择付款方式：</h3>
        <Radio.Group
          onChange={onChange}
          defaultValue={props.last4 == "" || props.last4 == undefined ? 2 : 1}
        >
          <Radio
            style={radioStyle}
            disabled={props.last4 == "" || props.last4 == undefined}
            value={1}
          >
            使用尾号为{props.last4}的信用卡付款
          </Radio>
          <Radio style={radioStyle} value={2}>
            使用新的信用卡付款
          </Radio>
        </Radio.Group>
      </Col>
      <Col xs={5}>
        <Button type="primary" onClick={handle_normal_pay}>
          继续结账
        </Button>
      </Col>
      <Col xs={5}>
        <Button onClick={handle_home}>继续选购</Button>
      </Col>
      <Col xs={5}>
        <Button onClick={handle_cart}>回购物车</Button>
      </Col>
    </Row>
  );
}

///////////////////////////////////
function createPaymentDetail(orderProduct, userInfo) {
  var paymentDetail = new Object();
  paymentDetail.userCode = userInfo.userCode;
  paymentDetail.otherFee = 0; //for test
  paymentDetail.shopAddress = userInfo.shopAddress;

  paymentDetail.product = [];
  for (var i = 0; i < orderProduct.length; i++) {
    paymentDetail.product.push(orderProduct[i]);
  }

  return paymentDetail;
}

export function BillInfo(props) {
  const [billInfo, setBillInfo] = useState({});

  useEffect(() => {
    // Step 1:get bill info and display to customer to confirm
    api
      .getBillInfo(createPaymentDetail(props.orderProduct, props.userInfo))
      .then((result) => {
        setBillInfo(result);

        store.dispatch({
          type: "MOD_TOTAL_PRICE",
          totalPrice: result.TotalPrice.totalPriceAfterTax,
        });
        console.log(result);
      });
  }, []);
  if (billInfo.TotalPrice != undefined) {
    return (
      <div style={{ marginTop: "5%", marginLeft: "10%" }}>
        <UserInfo
          orderNumber={billInfo.orderNumber}
          nickName={props.userInfo.nickName}
          email={props.userInfo.email}
          phone={props.userInfo.phone}
          shopAddress={props.userInfo.shopAddress}
        />
        <div style={{ marginTop: "2%" }}>
          <h3>购买详情：</h3>
          <OrderList subPrice={billInfo.subPrice} />
        </div>
        <TotalPrice
          totalPriceBeforeTax={billInfo.TotalPrice.totalPriceBeforeTax}
          shipFee={billInfo.TotalPrice.shipFee}
          otherFee={billInfo.TotalPrice.otherFee}
          taxRate={billInfo.TotalPrice.taxRate}
          tax={billInfo.TotalPrice.tax}
          totalPriceAfterTax={billInfo.TotalPrice.totalPriceAfterTax}
        />
        <PaymentMethod last4={billInfo.last4} />
      </div>
    );
  } else return <div></div>;
}

const mapStateToProps_BillInfo = (state) => {
  return {
    orderProduct: state.orderInfoReducer.orderProduct,
    userInfo: state.userInfoReducer,
  };
};

BillInfo = connect(mapStateToProps_BillInfo)(BillInfo);

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
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });
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
