import React from "react";

import { useEffect, useState } from "react";

import { Button, message, Modal, Divider } from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";
import { number } from "prop-types";

export function Reward(props) {
  const [isModal1Visible, setModal1Visible] = useState(false);
  const [isModal2Visible, setModal2Visible] = useState(false);
  const [amount, setAmount] = useState(0);

  function handle_cancel() {
    store.dispatch({
      type: "MOD_TOTAL_CUP",
      total_cup: 0,
    });
    store.dispatch({
      type: "MOD_REWARD_OUT",
      reward_out: 0,
    });
    history.push("/payment_1");
    setModal1Visible(false);
  }

  function handle_use() {
    store.dispatch({
      type: "MOD_TOTAL_CUP",
      total_cup: amount,
    });
    store.dispatch({
      type: "MOD_REWARD_OUT",
      reward_out: judgeRewardOut(
        amount,
        judgeMaxNumber(
          props.orderInfo,
          props.productList,
          props.userInfo.reward
        )[1]
      ),
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

  function judgeRewardOut(amount, number_none_top3) {
    if (amount <= number_none_top3) {
      return amount * 100;
    } else {
      return number_none_top3 * 100 + (amount - number_none_top3) * 150;
    }
  }

  function judgeClass(mainProductName, productList) {
    var result = false;

    for (var i = 0; i < productList.length; i++) {
      for (var j = 0; j < productList[i].product.length; j++) {
        if (productList[i].product[j].mainProductName == mainProductName) {
          if (productList[i].catalogName.slice(0, 3) == "TOP") {
            result = true;
            break;
          }
        }
      }
    }

    return result;
  }

  function judgeMaxNumber(orderInfo, productList, reward) {
    //first cal how many Top cup and how many none top cup

    var number_top3 = 0;
    var number_none_top3 = 0;

    for (var i = 0; i < orderInfo.orderProduct.length; i++) {
      if (
        judgeClass(orderInfo.orderProduct[i].mainProductName, productList) ==
        true
      ) {
        number_top3 = number_top3 + orderInfo.orderProduct[i].amount;
      } else {
        number_none_top3 = number_none_top3 + orderInfo.orderProduct[i].amount;
      }
    }

    var totalCup = 0;
    var rewardOut = 0;

    if (number_none_top3 * 100 >= reward) {
      totalCup = Math.floor(reward / 100);
      rewardOut = rewardOut * 100;
      return [totalCup, number_none_top3];
    }

    totalCup = number_none_top3;
    rewardOut = totalCup * 100;

    var reward_last = reward - rewardOut;
    var totalCup_top =
      number_top3 >= Math.floor(reward_last / 150)
        ? Math.floor(reward_last / 150)
        : number_top3;

    totalCup = totalCup + totalCup_top;
    rewardOut = rewardOut + totalCup_top * 150;

    return [totalCup, number_none_top3];
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
    if (
      amount <
      judgeMaxNumber(
        props.orderInfo,
        props.productList,
        props.userInfo.reward
      )[0]
    ) {
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
    if (props.userInfo.reward + getOrderNumber() * 10 < 80) {
      history.push("/payment_1");
    } else {
      if (props.userInfo.reward + getOrderNumber() * 10 < 100) {
        setModal2Visible(true);
      } else if (
        judgeMaxNumber(
          props.orderInfo,
          props.productList,
          props.userInfo.reward
        )[0] > 0
      ) {
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
          {judgeMaxNumber(
            props.orderInfo,
            props.productList,
            props.userInfo.reward
          )[0].toString()}
          杯奶茶
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
    productList: state.productListReducer,
  };
};
Reward = connect(mapStateToProps_Reward)(Reward);
