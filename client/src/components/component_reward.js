import React from "react";

import { useEffect, useState } from "react";

import { Button, message, Modal, Divider } from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

import { checkPic } from "./component_home";

export function Reward(props) {
  const [isModal1Visible, setModal1Visible] = useState(false);
  const [isModal2Visible, setModal2Visible] = useState(false);
  const [amount, setAmount] = useState(0);

  function handle_cancel() {
    store.dispatch({
      type: "MOD_REWARD_OUT",
      reward_out: 0,
    });
    history.push("/payment_1");
    setModal1Visible(false);
  }

  function handle_use() {
    store.dispatch({
      type: "MOD_REWARD_OUT",
      reward_out: amount * 100,
    });

    history.push("/payment_1");

    setModal1Visible(false);
  }

  function getOrderNumber() {
    var orderNumber = 0;

    for (var i = 0; i < props.orderInfo.orderProduct.length; i++) {
      orderNumber = orderNumber + props.orderInfo.orderProduct[i].amount;
    }

    return orderNumber;
  }

  function judgeMaxNumber() {
    var orderNumber = 0;

    for (var i = 0; i < props.orderInfo.orderProduct.length; i++) {
      orderNumber = orderNumber + props.orderInfo.orderProduct[i].amount;
    }

    return Math.floor(props.userInfo.reward / 100) > orderNumber
      ? orderNumber
      : Math.floor(props.userInfo.reward / 100);
  }

  function handle_dec() {
    var val = amount;
    val--;
    if (val < 0) {
      val = 0;
    }
    setAmount(val);
  }

  function handle_add() {
    if (amount < judgeMaxNumber()) {
      var val = amount;
      val++;
      setAmount(val);
    }
  }

  function handle_continue() {
    history.push("/payment_1");
    setModal2Visible(false);
  }

  function handle_back() {
    history.push("/home");
    setModal2Visible(false);
  }

  useEffect(() => {
    console.log("in reward");
    if (props.userInfo.reward + getOrderNumber() * 10 < 80) {
      history.push("/payment_1");
    } else {
      if (props.userInfo.reward + getOrderNumber() * 10 < 100) {
        setModal2Visible(true);
      } else if (props.userInfo.reward >= 100) {
        setModal1Visible(true);
      } else {
        history.push("/payment_1");
      }
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "2000px" }}>
      <div>{amount}</div>

      <Modal
        title="积分使用"
        visible={isModal1Visible}
        onOk={handle_use}
        onCancel={handle_cancel}
        width={400}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="使用积分"
        cancelText="不使用，继续"
      >
        <div>
          您当前可用积分:{props.userInfo.reward.toString()}
          ,本次购物可以用积分换购
          {judgeMaxNumber().toString()}杯奶茶
        </div>

        <div style={{ marginTop: "2%" }}>
          请选择换购杯数，将直接从货款中扣除：
        </div>

        <div style={{ marginTop: "3%" }}>
          <Button style={{ marginRight: "5%" }} onClick={handle_dec}>
            -
          </Button>
          {amount}
          <Button
            type="primary "
            style={{ marginLeft: "5%" }}
            onClick={handle_add}
          >
            +
          </Button>
        </div>
      </Modal>
      <Modal
        title="友情提醒"
        visible={isModal2Visible}
        onOk={handle_continue}
        onCancel={handle_back}
        width={400}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="继续结账"
        cancelText="重新选购"
      >
        <div>
          您当前可用积分:{props.userInfo.reward.toString()}
          ,再选购
          {Math.floor(
            (100 - props.userInfo.reward - getOrderNumber() * 10) / 10
          ).toString()}
          杯奶茶
        </div>

        <div style={{ marginTop: "2%" }}>下个订单可以免费换购一杯奶茶</div>
      </Modal>
    </div>
  );
}

const mapStateToProps_Reward = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
    userInfo: state.userInfoReducer,
  };
};
Reward = connect(mapStateToProps_Reward)(Reward);
