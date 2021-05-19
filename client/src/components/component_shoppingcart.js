import React from "react";

import { useEffect, useState } from "react";

import { Button, Modal, Affix, Spin, Divider, Tooltip } from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

import { checkPic } from "./component_home";

import { countTotalAmountByProductName } from "./component_home";

import cart from "../../images/cart.svg";
import home from "../../images/home.svg";
import deleteAll from "../../images/delete.svg";
import cash from "../../images/cash.svg";
import api from "../api";

//find mainProduct price

function findMainPrice(productList, mainProductName) {
  var price = 0;

  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      if (productList[i].product[j].mainProductName == mainProductName) {
        price = productList[i].product[j].price;
        break;
      }
    }
  }
  return price;
}

//find smallProduct price

function findSmallPrice(productList, smallProductName) {
  var price = 0;

  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      for (var k = 0; k < productList[i].product[j].productMiddle.length; k++) {
        for (
          var l = 0;
          l < productList[i].product[j].productMiddle[k].productSmall.length;
          l++
        ) {
          if (
            productList[i].product[j].productMiddle[k].productSmall[l]
              .smallProductName == smallProductName
          ) {
            price =
              productList[i].product[j].productMiddle[k].productSmall[l]
                .smallPrice;
            break;
          }
        }
      }
    }
  }
  return price;
}

function calShopSingle(productList, orderProduct) {
  var smallTotal = 0;

  for (var j = 0; j < orderProduct.smallProduct.length; j++) {
    var smallPrice = findSmallPrice(
      productList,
      orderProduct.smallProduct[j].productName
    );
    smallTotal = smallTotal + smallPrice * orderProduct.smallProduct[j].amount;
  }

  return (
    (smallTotal + findMainPrice(productList, orderProduct.mainProductName)) *
    orderProduct.amount
  );
}

function calShopTotal(productList, orderProduct) {
  var priceTotal = 0;
  for (var i = 0; i < orderProduct.length; i++) {
    priceTotal = priceTotal + calShopSingle(productList, orderProduct[i]);
  }

  return priceTotal;
}

///////////////////////////////////////////////////////

function ShopCard(props) {
  var price = "价格：$" + (props.price / 100).toFixed(2).toString();
  var smallProductList = props.smallProductList.map((item, index) => {
    if (item.amount == 0) {
      return <span key={index}>{item.productName} </span>;
    } else {
      return (
        <span key={index}>
          {item.productName}*{item.amount}
        </span>
      );
    }
  });

  function handle_add() {
    props.handle_add(
      props.mainProductName,
      props.smallProductList,
      props.amount
    );
  }

  function handle_dec() {
    props.handle_dec(
      props.mainProductName,
      props.smallProductList,
      props.amount
    );
  }
  return (
    <div>
      <div
        style={{
          marginLeft: "15%",
          marginTop: "5%",
        }}
      >
        <div style={{ marginLeft: "28%" }}>
          <img src={props.picFile} style={{ width: "20%", height: "20%" }} />
        </div>
        <div style={{ marginLeft: "20%", marginTop: "5%" }}>
          <Row>
            <Col xs={8}>
              <h3>{props.mainProductName}</h3>
            </Col>
            <Col xs={10} style={{ marginLeft: "0%" }}>
              <Button style={{ marginRight: "5%" }} onClick={handle_dec}>
                -
              </Button>
              {props.amount}
              <Button
                type="primary "
                style={{ marginLeft: "5%" }}
                onClick={handle_add}
              >
                +
              </Button>
            </Col>
          </Row>
          <div style={{ marginTop: "2%" }}>{smallProductList}</div>
          <div style={{ marginTop: "5%" }}>
            <h3>{price}</h3>
          </div>
        </div>
      </div>
      <Divider />
    </div>
  );
}

function OrderTotal(props) {
  var price = calShopTotal(props.productList, props.orderProduct);
  var price_s = "总价格:$" + (price / 100).toFixed(2).toString();
  return (
    <div style={{ marginLeft: "28%", marginTop: "5%" }}>
      <div style={{ marginLeft: "5%" }}>
        <h2>{price_s}</h2>
      </div>
    </div>
  );
}

const mapStateToProps_OrderTotal = (state) => {
  return {
    orderProduct: state.orderInfoReducer.orderProduct,
    productList: state.productListReducer,
  };
};

OrderTotal = connect(mapStateToProps_OrderTotal)(OrderTotal);

/*style={{
  position: "absolute",
  width: "100%",
  height: "100%",
  left: "0",
  top: "0",
  bottom: "0",
  backgroundImage: `url(${bg1})`,
  backgroundSize: "cover",
  backgroundColor: "yellow",
  overflow: "auto"
}}*/

function ShopCard_container(props) {
  function getOrderNumber() {
    var orderNumber = 0;

    for (var i = 0; i < props.orderInfo.orderProduct.length; i++) {
      orderNumber = orderNumber + props.orderInfo.orderProduct[i].amount;
    }

    return orderNumber;
  }

  function handle_pay() {
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
  function handle_home() {
    history.push("/home");
  }
  function handle_delete() {
    setModalVisible(true);
  }
  function handle_ok() {
    store.dispatch({
      type: "DEL_ALL_ORDER_PRODUCT",
    });

    setModalVisible(false);
    history.push("/home");
  }
  function handle_cancel() {
    setModalVisible(false);
  }
  function handle_cancel1() {
    setPayVisible(false);
  }

  const [isModalVisible, setModalVisible] = useState(false);
  const [isPayVisible, setPayVisible] = useState(false);
  return (
    <div>
      <div
        style={{ position: "fixed", top: "1%", width: "100%", zIndex: "50" }}
      >
        <div
          style={{
            position: "relative",
            zIndex: "10",
          }}
        >
          <div style={{ position: "absolute", width: "100%" }}>
            <Row>
              <Col xs={4} style={{ marginLeft: "15%", marginRight: "11%" }}>
                <Tooltip title="返回" color={"blue"} placement={"bottom"}>
                  <a onClick={handle_home}>
                    <img src={home} style={{ width: "32px" }}></img>
                  </a>
                </Tooltip>
              </Col>

              <Col xs={4} style={{ marginRight: "15%" }}>
                <Tooltip title="去付款" color={"blue"} placement={"bottom"}>
                  <a onClick={handle_pay}>
                    <img src={cash} style={{ width: "32px" }}></img>
                  </a>
                </Tooltip>
              </Col>

              <Col xs={4}>
                <Tooltip title="清空购物车" color={"blue"} placement={"bottom"}>
                  <a onClick={handle_delete}>
                    <img src={deleteAll} style={{ width: "26px" }}></img>
                  </a>
                </Tooltip>
              </Col>

              <Modal
                title="清空购物车"
                visible={isModalVisible}
                onOk={handle_ok}
                onCancel={handle_cancel}
                width={300}
                closable={false}
                centered={true}
                maskClosable={false}
                okText="确认"
                cancelText="取消"
              >
                "请确认是否清空购物车"
              </Modal>
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
            </Row>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "8%" }}>
        {props.children}
        <OrderTotal />
      </div>
    </div>
  );
}

const mapStateToProps_ShopCard_container = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
    userInfo: state.userInfoReducer,
  };
};
ShopCard_container = connect(mapStateToProps_ShopCard_container)(
  ShopCard_container
);

function findPicFileByName(productList, productName) {
  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      if (productList[i].product[j].mainProductName == productName) {
        return productList[i].product[j].picFile;
      }
    }
  }
}

function findProductStockByName(productList, mainProductName) {
  var stock = 0;
  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      if (productList[i].product[j].mainProductName == mainProductName) {
        stock = productList[i].product[j].stock;
        return stock;
      }
    }
  }
}

export function ShopCardList(props) {
  const [loading, setLoading] = useState(true);
  const [isVisble, setVisble] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    checkPic(props.productList, props.shopAddress, setLoading);
    setLoading(props.productList.length > 0 ? false : true);
  }, []);

  function handle_cancel() {
    setVisble(false);
  }

  function handle_add(mainProductName, smallProduct, amount) {
    if (
      countTotalAmountByProductName(props.orderProduct, mainProductName) + 1 >
      findProductStockByName(props.productList, mainProductName)
    ) {
      var msg_d = "当前库存不够，无法再增加购买";
      setMsg(msg_d);
      setVisble(true);
      return;
    }
    var productList = new Object();

    productList.mainProductName = mainProductName;
    productList.amount = 1;
    productList.smallProduct = smallProduct.slice(0);

    store.dispatch({
      type: "ADD_ORDER_PRODUCT",
      productList: productList,
    });
  }

  function handle_dec(mainProductName, smallProduct) {
    var productList = new Object();

    productList.mainProductName = mainProductName;
    productList.amount = 1;
    productList.smallProduct = smallProduct.slice(0);

    store.dispatch({
      type: "DEC_ORDER_PRODUCT",
      productList: productList,
    });
  }

  if (props.productList.length > 0) {
    const shopCardList = props.orderProduct.map((item, index) => {
      var picFile = findPicFileByName(props.productList, item.mainProductName);
      var price = calShopSingle(props.productList, item);
      return (
        <ShopCard
          key={index}
          smallProductList={item.smallProduct.slice(0)}
          picFile={picFile}
          mainProductName={item.mainProductName}
          amount={item.amount}
          price={price}
          handle_add={handle_add}
          handle_dec={handle_dec}
        />
      );
    });
    return (
      <div>
        <ShopCard_container>{shopCardList}</ShopCard_container>
        <Modal
          title="友情提醒"
          visible={isVisble}
          onOk={handle_cancel}
          onCancel={handle_cancel}
          width={300}
          closable={false}
          centered={true}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
        >
          {msg}
        </Modal>
      </div>
    );
  } else {
    return <Spin spinning={loading}></Spin>;
  }
}

const mapStateToProps_ShopCardList = (state) => {
  return {
    orderProduct: state.orderInfoReducer.orderProduct,
    productList: state.productListReducer,
    shopAddress: state.userInfoReducer.shopAddress,
  };
};

ShopCardList = connect(mapStateToProps_ShopCardList)(ShopCardList);
