import React from "react";
import { useEffect, useState } from "react";

import {
  List,
  Card,
  Button,
  Slider,
  Radio,
  Select,
  message,
  Badge,
  Affix,
  Spin,
  Divider,
  Drawer,
  Menu,
  Modal,
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

import cart from "../../images/cart.png";

import menu from "../../images/menu.svg";
import order from "../../images/order.png";
import cash from "../../images/cash.png";
import info from "../../images/info.png";
import login from "../../images/login.png";
import logout from "../../images/logout.png";
import phone from "../../images/phone.png";
import reward from "../../images/reward.png";

import api from "../api";
import { deleteLogin } from "./component_login";

export function Menu_1(props) {
  const [visible, setVisble] = useState(false);
  const [isPayVisible, setPayVisible] = useState(false);

  function getOrderNumber() {
    var orderNumber = 0;

    for (var i = 0; i < props.orderInfo.orderProduct.length; i++) {
      orderNumber = orderNumber + props.orderInfo.orderProduct[i].amount;
    }

    return orderNumber;
  }

  function handle_cancel1() {
    setPayVisible(false);
  }

  function onClose() {
    setVisble(false);
  }

  function onClick() {
    setVisble(true);
  }

  function handle_logout() {
    store.dispatch({
      type: "DEL_USER_INFO",
    });

    store.dispatch({
      type: "DEL_ALL_ORDER_PRODUCT",
    });

    deleteLogin();

    history.push("/");
  }

  function handle_login() {
    history.push("/");
  }

  function handle_cart() {
    history.push("/cart");
  }

  function handle_payment() {
    store.dispatch({
      type: "MOD_REWARD_OUT",
      reward_out: 0,
    });
    if (props.orderInfo.orderProduct.length > 0) {
      if (
        props.userInfo.reward + getOrderNumber() * 10 < 80 ||
        props.userInfo.userCode.charAt(0) == "T"
      ) {
        history.push("/payment_1");
      } else {
        history.push("/reward");
      }
    } else {
      setPayVisible(true);
    }
  }

  function getOrderList() {
    history.push("/orderList");
  }

  return (
    <div>
      <div onClick={onClick}>
        <a>
          <img src={menu} style={{ width: "32px" }} />
        </a>
      </div>
      <Drawer
        title="主菜单"
        placement={"left"}
        closable={false}
        onClose={onClose}
        visible={visible}
        width={200}
      >
        <div>
          <span>
            <a style={{ color: "black" }} onClick={handle_cart}>
              <img src={cart} style={{ width: "20%" }} />
              &nbsp;&nbsp;购物车
            </a>
          </span>
        </div>
        <div style={{ marginTop: "4%" }}>
          <span>
            <a style={{ color: "black" }} onClick={getOrderList}>
              <img src={order} style={{ width: "20%" }} />
              &nbsp;&nbsp;我的订单
            </a>
          </span>
        </div>
        <div style={{ marginTop: "4%" }}>
          <span>
            <a style={{ color: "black" }} onClick={handle_payment}>
              <img src={cash} style={{ width: "20%" }} />
              &nbsp;&nbsp;付款
            </a>
          </span>
        </div>

        <div style={{ marginTop: "30%" }}>
          <span>
            <Badge
              showZero
              overflowCount={100000}
              count={props.userInfo.reward}
              offset={[-60, 0]}
            >
              >
              <a style={{ color: "black" }}>
                <img src={reward} style={{ width: "15%" }} />
                &nbsp;&nbsp;积分
              </a>
            </Badge>
          </span>
        </div>

        <div style={{ marginTop: "4%" }}>
          <span>
            <a style={{ color: "black" }}>
              <img src={info} style={{ width: "15%" }} />
              &nbsp;&nbsp;个人信息
            </a>
          </span>
        </div>

        <div
          style={{
            marginTop: "4%",
            display: props.userInfo.email != "" ? "none" : "block",
          }}
        >
          <span>
            <a style={{ color: "black" }} onClick={handle_login}>
              <img src={login} style={{ width: "15%" }} />
              &nbsp;&nbsp;登陆
            </a>
          </span>
        </div>

        <div
          style={{
            marginTop: "4%",
            display: props.userInfo.email != "" ? "block" : "none",
          }}
        >
          <span>
            <a style={{ color: "black" }} onClick={handle_logout}>
              <img src={logout} style={{ width: "15%" }} />
              &nbsp;&nbsp;登出
            </a>
          </span>
        </div>

        <div style={{ marginTop: "30%" }}>
          <span>
            <a style={{ color: "black" }}>
              <img src={phone} style={{ width: "15%" }} />
              &nbsp;&nbsp;商家信息
            </a>
          </span>
        </div>
      </Drawer>
      <Modal
        title="错误"
        visible={isPayVisible}
        onOk={handle_cancel1}
        onCancel={handle_cancel1}
        width={300}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        购物车没有商品，无法结账！
      </Modal>
    </div>
  );
}

const mapStateToProps_menu = (state) => {
  return {
    userInfo: state.userInfoReducer,
    orderInfo: state.orderInfoReducer,
  };
};

Menu_1 = connect(mapStateToProps_menu)(Menu_1);
