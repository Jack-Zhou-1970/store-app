import React from "react";
import { useState } from "react";

import { Button, message, Modal, Affix } from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

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

const err = (msg) => {
  message.error(msg, 2);
};

function ShopCard(props) {
  var price = "价格：$" + (props.price / 100).toString();
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
    props.handle_add(props.mainProductName, props.smallProductList);
  }

  function handle_dec() {
    props.handle_dec(props.mainProductName, props.smallProductList);
  }
  return (
    <div>
      <div style={{ marginLeft: "15%" }}>
        <div style={{ marginLeft: "35%" }}>
          <img src={props.picFile} style={{ width: "30%", height: "30%" }} />
        </div>
        <div style={{ marginLeft: "5%", marginTop: "5%" }}>
          <Row>
            <Col xs={12}>
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
    </div>
  );
}

function OrderTotal(props) {
  var price = calShopTotal(props.productList, props.orderProduct);
  var price_s = "总价格:$" + (price / 100).toString();
  return (
    <div style={{ marginLeft: "15%", marginTop: "5%" }}>
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

function ShopCard_container(props) {
  function handle_pay() {
    history.push("/payment_1");
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

  const [isModalVisible, setModalVisible] = useState(false);
  return (
    <div style={{ marginTop: "15%" }}>
      {props.children}
      <OrderTotal />
      <Affix offsetBottom={10} style={{ marginLeft: "20%", marginTop: "10%" }}>
        <Row>
          <Col xs={4} style={{ marginRight: "8%" }}>
            <Button type="primary " onClick={handle_pay}>
              结算
            </Button>
          </Col>

          <Col xs={4} style={{ marginRight: "8%" }}>
            <Button type="primary " onClick={handle_home}>
              主页
            </Button>
          </Col>
          <Col xs={4}>
            <Button type="primary " onClick={handle_delete}>
              清空
            </Button>
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
            请确认是否要清空购物车？
          </Modal>
        </Row>
      </Affix>
    </div>
  );
}

function findPicFileByName(productList, productName) {
  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      if (productList[i].product[j].mainProductName == productName) {
        return productList[i].product[j].picFile;
      }
    }
  }
}

export function ShopCardList(props) {
  function handle_add(mainProductName, smallProduct) {
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
  return <ShopCard_container>{shopCardList}</ShopCard_container>;
}

const mapStateToProps_ShopCardList = (state) => {
  return {
    orderProduct: state.orderInfoReducer.orderProduct,
    productList: state.productListReducer,
  };
};

ShopCardList = connect(mapStateToProps_ShopCardList)(ShopCardList);
