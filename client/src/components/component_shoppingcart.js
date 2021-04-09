import React from "react";

import { Button, Select, message, Image } from "antd";
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
      if (productList[i].product[j].mainProductName == mainProductName)
        price = productList[i].product[j].price;
      break;
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

const err = (msg) => {
  message.error(msg, 2);
};

function ShopCard(props) {
  var price = "$" + (props.price / 100).toString();
  var smallProductList = props.smallProductList.map((item, index) => {
    if (item.amount == 0) {
      return (
        <Col key={index} xs={6} style={{ marginLeft: "2%" }}>
          {item.productName}
        </Col>
      );
    } else {
      return (
        <Col key={index} xs={6} style={{ marginLeft: "2%" }}>
          {item.productName}*{item.amount}
        </Col>
      );
    }
  });
  return (
    <div>
      <Row style={{ marginLeft: "15%" }}>
        <Col xs={8}>
          <Image src={props.picFile} />
        </Col>
        <Col xs={12} style={{ marginLeft: "5%" }}>
          <Row>
            <Col xs={12}>{props.mainProductName}</Col>
            <Col xs={6} style={{ marginLeft: "10%" }}>
              <Select style={{ width: "80%" }} placeholder={props.amount}>
                <Option value="0">0杯</Option>
                <Option value="1">1杯</Option>
                <Option value="2">2杯</Option>
                <Option value="3">3杯</Option>
                <Option value="4">4杯</Option>
                <Option value="5">5杯</Option>
              </Select>
            </Col>
          </Row>
          <Row style={{ marginTop: "5%" }}>{smallProductList}</Row>
        </Col>
      </Row>
    </div>
  );
}

function ShopCard_container(props) {
  return (
    <div>
      <div>header</div>
      {props.children}
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
  const shopCardList = props.orderProduct.map((item, index) => {
    var picFile = findPicFileByName(props.productList, item.mainProductName);
    return (
      <ShopCard
        key={index}
        smallProductList={item.smallProduct.slice(0)}
        picFile={picFile}
        mainProductName={item.mainProductName}
        amount={item.amount}
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
