import React, { useEffect, useState } from "react";

import api from "../api";

import { Button } from "antd";
import { Row, Col } from "antd";
import { Descriptions, List, Radio, Modal, Affix } from "antd";

import "antd/dist/antd.css";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

import home from "../../images/home.svg";

function UserInfo(props) {
  console.log(props.userInfo);
  return (
    <div style={{ marginLeft: "15%" }}>
      <Descriptions title="用户信息:">
        <Descriptions.Item label="昵称">
          {props.userInfo.nickName}
        </Descriptions.Item>
        <Descriptions.Item label="EMAIL">
          {props.userInfo.email}
        </Descriptions.Item>
        <Descriptions.Item label="电话">
          {props.userInfo.phone}
        </Descriptions.Item>
        <Descriptions.Item label="店铺地址">
          {props.userInfo.shopAddress}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}

const mapStateToProps_UserInfo = (state) => {
  return {
    userInfo: state.userInfoReducer,
  };
};

UserInfo = connect(mapStateToProps_UserInfo)(UserInfo);

function OrderSum(props) {
  var paymentTime = new Date(props.paymentTime);
  return (
    <div style={{ marginTop: "2%" }}>
      <Descriptions title="订单信息:">
        <Descriptions.Item label="订单号">
          {props.orderNumber}
        </Descriptions.Item>
        <Descriptions.Item label="总价(税后)">
          {(props.totalPrice / 100).toFixed(2).toString()}
        </Descriptions.Item>
        <Descriptions.Item label="时间">
          {paymentTime.toString()}
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
      subPrice[i].mainProductName + "      数量:" + subPrice[i].amount;
    data.smallProduct = "";
    for (var j = 0; j < subPrice[i].smallProduct.length; j++) {
      var amount =
        subPrice[i].smallProduct[j].amount > 0
          ? "*" + subPrice[i].smallProduct[j].amount
          : "";
      data.smallProduct =
        data.smallProduct +
        subPrice[i].smallProduct[j].smallProductName +
        amount +
        "         ";
    }
    dataArray.push(data);
  }

  return dataArray;
}

export function OrderList(props) {
  const [orderInfo, setOrderInfo] = useState([]);

  useEffect(() => {
    api.getOrder(props.userInfo).then((result) => {
      setOrderInfo(result);
    });
  }, []);

  function handle_home() {
    history.push("/home");
  }

  if (orderInfo.length > 0) {
    const orderlist = orderInfo.map((item, index) => {
      const data = createData(item.product);

      return (
        <div style={{ marginLeft: "15%" }}>
          <OrderSum
            key={index}
            orderNumber={item.orderNumber}
            totalPrice={item.totalPrice}
            paymentTime={item.paymentTime}
          />

          <List
            itemLayout="horizontal"
            split={false}
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
          <div
            style={{
              width: "80%",
              border: "solid #ACC0D8 1px",
            }}
          ></div>
        </div>
      );
    });

    return (
      <div>
        <div style={{ position: "fixed", left: "5%" }}>
          <div
            style={{
              zIndex: "10",
            }}
          >
            <a onClick={handle_home}>
              <img src={home} style={{ width: "32px" }}></img>
            </a>
          </div>
        </div>
        <UserInfo />
        {orderlist}
      </div>
    );
  } else {
    return <div>没有订单，按后退键返回</div>;
  }
}

const mapStateToProps_OrderList = (state) => {
  return {
    userInfo: state.userInfoReducer,
  };
};

OrderList = connect(mapStateToProps_OrderList)(OrderList);
