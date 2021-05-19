import React from "react";
import { useEffect, useState } from "react";

import {
  Button,
  message,
  Badge,
  Affix,
  Divider,
  Drawer,
  Menu,
  Modal,
  Descriptions,
  Avatar,
} from "antd";
import { Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";

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
import address from "../../images/address.jpg";

import api from "../api";
import { deleteLogin } from "./component_login";

function Map() {
  return (
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2879.3726349500985!2d-79.33834730000001!3d43.806629499999985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d3b2004180f3%3A0xfc3469dda1989d4a!2z5LiW55WM6Iy26aWuIFdvcmxkIFRlYSBIb3VzZQ!5e0!3m2!1sen!2sca!4v1618796634921!5m2!1sen!2sca"
      width={300}
      height={300}
      style={{ border: "0;" }}
      allowfullscreen={""}
      loading={"lazy"}
    ></iframe>
  );
}

export function Menu_1(props) {
  const [visible, setVisble] = useState(false);
  const [isPayVisible, setPayVisible] = useState(false);
  const [isUserVisible, setUserVisible] = useState(false);
  const [isMapVisible, setMapVisible] = useState(false);
  const [isRewardVisible, setRewardVisible] = useState(false);

  function handle_info() {
    setUserVisible(true);
  }

  function handle_cancel2() {
    setUserVisible(false);
  }
  function handle_cancel3() {
    setMapVisible(false);
  }
  function handle_contact() {
    setMapVisible(true);
  }

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

  function handle_cancel5() {
    setRewardVisible(false);
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

  function handle_reward() {
    setRewardVisible(true);
  }

  function handle_payment() {
    store.dispatch({
      type: "MOD_TOTAL_CUP",
      total_cup: 0,
    });

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
        var reward;
        api.getReward(props.userInfo).then((result) => {
          if (
            result[0].reward == null ||
            result[0].reward == undefined ||
            result[0].reward == ""
          ) {
            reward = 0;
          } else {
            reward = result[0].reward;
          }
          store.dispatch({
            type: "UPDATE_REWARD",
            payload: reward,
          });

          history.push("/reward");
        });
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
      <div>
        <a onClick={onClick}>
          <img src={menu} style={{ width: "32px" }} />
        </a>
        &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;
        <Avatar
          style={{ backgroundColor: "#87d068" }}
          icon={<UserOutlined />}
        />
        &nbsp;&nbsp;{props.userInfo.nickName}
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
              <a style={{ color: "black" }} onClick={handle_reward}>
                <img src={reward} style={{ width: "15%" }} />
                &nbsp;&nbsp;积分
              </a>
            </Badge>
          </span>
        </div>

        <div style={{ marginTop: "4%" }}>
          <span>
            <a style={{ color: "black" }} onClick={handle_info}>
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
            <a style={{ color: "black" }} onClick={handle_contact}>
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
      <Modal
        visible={isUserVisible}
        onOk={handle_cancel2}
        onCancel={handle_cancel2}
        cancelButtonProps={{ disabled: true }}
        width={800}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        <Descriptions bordered size="small" title="用户信息:">
          <Descriptions.Item label="昵称">
            {props.userInfo.nickName}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {props.userInfo.email}
          </Descriptions.Item>
          <Descriptions.Item label="电话">
            {props.userInfo.phone}
          </Descriptions.Item>
          <Descriptions.Item label="可用积分">
            {props.userInfo.reward}
          </Descriptions.Item>
          <Descriptions.Item label="pickup地址">
            {props.userInfo.shopAddress}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
      <Modal
        title="世界茶饮"
        visible={isMapVisible}
        onOk={handle_cancel3}
        onCancel={handle_cancel3}
        cancelButtonProps={{ disabled: true }}
        width={500}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        <img src={address} style={{ width: "100%" }} />
      </Modal>
      <Modal
        visible={isRewardVisible}
        onOk={handle_cancel5}
        onCancel={handle_cancel5}
        cancelButtonProps={{ disabled: true }}
        width={400}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
      >
        <h3 style={{ color: "red" }}>积分:{props.userInfo.reward}</h3>
        <h3>当前积分兑换规则：</h3>
        <p>每购买一杯可兑换10个积分</p>
        <p>每100积分可换购一杯奶茶，在购买时扣除相应金额</p>
        <p>欢迎选购！</p>
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
