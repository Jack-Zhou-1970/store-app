import React from "react";
import { useEffect, useState } from "react";

import {
  List,
  Card,
  Button,
  Slider,
  Radio,
  Badge,
  Affix,
  Spin,
  Divider,
  Carousel,
  Modal,
  notification,
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

import add from "../../images/add.svg";

import cart from "../../images/cart.svg";

import api from "../api";
import { Menu_1 } from "./component_menu";

import bg1 from "../../images/bg1.jpg";

import css from "./component_home.css";

export var sectionStyle = {
  width: "100%",
  height: "100%",
  // makesure here is String确保这里是一个字符串，以下是es6写法
  /*backgroundImage: `url(${bg1})`,*/
  backgroundSize: "cover",
};

////////////////////////////////////////////////////////////////////////////////api function:

//the funtion  used to display total price  and two button

function calTotalPrice(productDetail) {
  var smallTotalPrice = 0;
  for (var i = 0; i < productDetail.productMiddle.length; i++) {
    for (
      var j = 0;
      j < productDetail.productMiddle[i].productSmall.length;
      j++
    ) {
      if (productDetail.productMiddle[i].productSmall[j].smallPrice_T > 0) {
        smallTotalPrice =
          smallTotalPrice +
          productDetail.productMiddle[i].productSmall[j].smallPrice_T;
      }
    }
  }

  return (smallTotalPrice + productDetail.price) * productDetail.amount;
}

function checkValidate(productList, productDetail) {
  var result = [];
  function findMiddleProduct(input) {
    return input.middleProductName == this;
  }

  if (productDetail.amount == 0) {
    result.push("主产品数量不能为0");
    result.push("Product Quantity can not be 0");
    return result;
  }

  //counter 加料
  var count = 0;
  for (var i = 0; i < productDetail.productMiddle.length; i++) {
    if (productDetail.productMiddle[i].middleProductName == "TOPPINGS") {
      for (
        var j = 0;
        j < productDetail.productMiddle[i].productSmall.length;
        j++
      ) {
        if (productDetail.productMiddle[i].productSmall[j].amount > 0) {
          count = count + productDetail.productMiddle[i].productSmall[j].amount;
        }
      }
    }
  }
  if (count > 3) {
    result.push("Toppings不能超过3份");
    result.push("The sum of toppings can not exceed three");
    return result;
  }

  //check if middProduct Number is correct
  var midProduct = findMiddleProductNumber_NP(
    productList,
    productDetail.productName
  );

  if (midProduct.length > 0) {
    for (var k = 0; k < midProduct.length; k++) {
      if (
        productDetail.productMiddle.find(findMiddleProduct, midProduct[k]) ==
        undefined
      ) {
        result.push(midProduct[k] + "必须选择");
        result.push(midProduct[k] + " " + "is required");
        return result;
      }
    }
  }

  result.push("success");

  return result;
}

function addToCart(productDetail) {
  var smallProduct = [];

  for (var i = 0; i < productDetail.productMiddle.length; i++) {
    for (
      var j = 0;
      j < productDetail.productMiddle[i].productSmall.length;
      j++
    ) {
      var smallProduct_o = new Object();
      smallProduct_o.productName =
        productDetail.productMiddle[i].productSmall[j].smallProductName;
      smallProduct_o.amount =
        productDetail.productMiddle[i].productSmall[j].amount;
      smallProduct.push(smallProduct_o);
    }
  }

  var productList = new Object();
  productList.mainProductName = productDetail.productName;
  productList.productIntro = productDetail.productIntro;
  productList.amount = productDetail.amount;
  productList.smallProduct = smallProduct;

  store.dispatch({
    type: "ADD_ORDER_PRODUCT",
    productList: productList,
  });
}

function findSmallPrice(inputProduct) {
  return inputProduct.smallPrice > 0;
}

function findMiddleProductName(input) {
  return input == this;
}

function findSmallPrice_T(productMiddle, middleProductName, smallProductName) {
  var price_t = 0;
  if (productMiddle != undefined) {
    for (var i = 0; i < productMiddle.length; i++) {
      if (productMiddle[i].middleProductName == middleProductName) {
        for (var j = 0; j < productMiddle[i].productSmall.length; j++) {
          if (
            productMiddle[i].productSmall[j].smallProductName ==
            smallProductName
          ) {
            price_t = productMiddle[i].productSmall[j].smallPrice_T;
            break;
          }
        }
      }
    }
  }

  return price_t;
}

//find which middleProductName price = 0;

function findMiddleProductNumber_NP(productList, mainProductName) {
  var midProduct = [];
  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      if (productList[i].product[j].mainProductName == mainProductName) {
        for (
          var k = 0;
          k < productList[i].product[j].productMiddle.length;
          k++
        ) {
          if (
            productList[i].product[j].productMiddle[k].productSmall.find(
              findSmallPrice
            ) == undefined
          ) {
            midProduct.push(
              productList[i].product[j].productMiddle[k].middleProductName
            );
          }
        }
      }
    }
  }

  return midProduct;
}

//判断图片是否存在

function is_img_url(imgurl) {
  return new Promise(function (resolve, reject) {
    var ImgObj = new Image(); //判断图片是否存在
    ImgObj.src = imgurl;
    ImgObj.onload = function (res) {
      resolve(res);
    };
    ImgObj.onerror = function (err) {
      reject(err);
    };
  }).catch((e) => {}); // 加上这句不会报错（Uncaught (in promise)）
}

export async function checkPic(data, shopAddress, version, func) {
  console.log("checkPic");
  var result1 = false;

  if (data != null && data != undefined && data.length != 0) {
    result1 = true;
    for (var i = 0; i < data.length; i++) {
      for (var j = 0; j < data[i].product.length; j++) {
        var result = await is_img_url(data[i].product[j].picFile);
        if (result == undefined) {
          result1 = false;
          break;
        }
      }
    }
  }

  //check version number
  var obj = new Object();
  obj.shopAddress = shopAddress;

  var result = await api.getProductVersion(obj);

  var result2;

  if (result.productVersion == version) {
    result2 == true;
  } else {
    result2 = false;
    store.dispatch({
      type: "UPDATE_PRODUCT_VERSION",
      payload: result.productVersion,
    });
  }

  if (result1 == false || result2 == false) {
    store.dispatch({
      type: "UPDATE_PRODUCT_INFO",
      payload: [],
    });
    func(true);
    console.log("load productList");
    await reloadProductList(shopAddress);
    func(false);
  }
}

async function reloadProductList(shopAddress) {
  var productList = await api.getProductList({
    shopAddress: shopAddress,
  });

  productList = await api.processProductList(productList);

  store.dispatch({
    type: "UPDATE_PRODUCT_INFO",
    payload: productList,
  });
}

export function countTotalAmountByProductName(orderProduct, mainProductName) {
  if (orderProduct == [] || orderProduct.length == 0) {
    return 0;
  }

  var total = 0;
  for (var i = 0; i < orderProduct.length; i++) {
    if (orderProduct[i].mainProductName == mainProductName) {
      total = total + orderProduct[i].amount;
    }
  }

  return total;
}

function updateProductListAmount(productList, mainProductName, amount) {
  for (var i = 0; i < productList.length; i++) {
    for (var j = 0; j < productList[i].product.length; j++) {
      if (productList[i].product[j].mainProductName == mainProductName) {
        productList[i].product[j].stock = amount;
      }
    }
  }

  return productList;
}

///////////////////////////////////////////////////////////////////////////////////the function used to display product header

import b_1 from "../../images/b_1.jpg";
import b_2 from "../../images/b_2.jpg";
import b_3 from "../../images/b_3.jpg";
import b_4 from "../../images/b_4.jpg";
import b_5 from "../../images/b_5.jpg";
import b_main from "../../images/b_main.jpg";

import { AliPayResult_manage } from "./component_wallet";

export function Home_header(props) {
  function handle_click() {
    history.push("/cart");
  }

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div
          offsetTop={30}
          style={{ backgroundColor: "white", marginLeft: "5%" }}
        >
          <Menu_1 />
        </div>
        <div
          style={{ position: "fixed", top: "1%", left: "85%", zIndex: "50" }}
        >
          <Badge count={props.orderInfo.orderProduct.length}>
            <a onClick={handle_click}>
              <img src={cart} style={{ width: "32px" }} />
            </a>
          </Badge>
        </div>
        <Row style={{ marginBottom: "5%", zIndex: "-10" }}>
          <Col xs={8}>
            <img
              alt={"world tea ,North York"}
              src={b_main}
              style={{ width: "103%" }}
            />
          </Col>
          <Col xs={16}>
            <Carousel autoplay>
              <div>
                <img
                  alt={"world tea,WORLD MILK TEA"}
                  src={b_1}
                  style={{ width: "101%" }}
                />
              </div>
              <div>
                <img
                  alt={"world tea ,FRESH FRULT WITH PROBIOTICS"}
                  src={b_2}
                  style={{ width: "104%" }}
                />
              </div>
              <div>
                <img
                  alt={"world tea,FRESH FRULT TEA"}
                  src={b_3}
                  style={{ width: "102%" }}
                />
              </div>
              <div>
                <img
                  alt={"world tea,FRESH FRULT SLUSH"}
                  src={b_4}
                  style={{ width: "102%" }}
                />
              </div>
              <div>
                <img
                  alt={"world tea,Monet Garden Fruit Tea"}
                  src={b_5}
                  style={{ width: "101%" }}
                />
              </div>
            </Carousel>
          </Col>
        </Row>
      </div>
    </div>
  );
}

const mapStateToProps_Home_header = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
  };
};

Home_header = connect(mapStateToProps_Home_header)(Home_header);

///////////////////////////////////////////////////////////////////////////////the function used to display product detail

export function Home_productDetail(props) {
  const [message_c, setMessage_c] = useState("");
  const [message_e, setMessage_e] = useState("");
  const [isVisble, setVisble] = useState(false);
  function handle_home() {
    history.push("/home");
  }

  function handle_cancel() {
    setVisble(false);
  }

  function handle_add_cart() {
    var result = checkValidate(props.productList, props.productDetail);

    if (result[0] == "success") {
      addToCart(props.productDetail);

      notification.open({
        message: "",
        description: "成功加入购物车 Successfully added to the shopping cart",
        duration: 2,
        placement: "topLeft",
      });

      props.handle_close();
    } else {
      setMessage_c(result[0]);
      setMessage_e(result[1]);
      setVisble(true);
    }
  }

  return (
    <div>
      <Affix offsetTop={0}>
        <div
          style={{
            zIndex: "10",
          }}
        >
          <Row>
            <Col xs={4} offset={20}>
              <div style={{ width: "20%" }}>
                <a onClick={handle_add_cart}>
                  <img src={add} style={{ width: "32px" }}></img>
                </a>
              </div>
            </Col>
          </Row>
        </div>
      </Affix>
      <div style={{ marginLeft: "5%", marginTop: "5%", marginRight: "5%" }}>
        <div>
          <MainProduct_container />
        </div>
        <Divider />
        <div style={{ marginTop: "5%" }}>
          <MidSmallProduct />
          <Divider />
          <MidSmallPrice />
        </div>
      </div>
      <Modal
        title="Message"
        visible={isVisble}
        onOk={handle_cancel}
        onCancel={handle_cancel}
        width={400}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="OK"
        cancelText="Cancel"
      >
        <p>{message_c}</p>
        <p>{message_e}</p>
      </Modal>
    </div>
  );
}

const mapStateToProps_Home_productDetail = (state) => {
  return {
    productDetail: state.productDetailReducer,
    productList: state.productListReducer,
  };
};

Home_productDetail = connect(mapStateToProps_Home_productDetail)(
  Home_productDetail
);

/////////////////////////////////////////////////////////////////////////////////////////////////the function  below used to display mid small area

function MidSmallPrice(props) {
  var price = calTotalPrice(props.productDetail);
  var price_s = "Total Price：$" + (price / 100).toFixed(2).toString();

  return (
    <div style={{ marginTop: "2%" }}>
      <h3>{price_s}</h3>
    </div>
  );
}

const mapStateToProps_totalPrice = (state) => {
  return {
    productDetail: state.productDetailReducer,
  };
};

MidSmallPrice = connect(mapStateToProps_totalPrice)(MidSmallPrice);

//////////////////////////////////////////////////////////////////////////////////////////////the function used to display mid small product
function MidSmallProduct(props) {
  var midClass_np = [];
  var midClass_p = [];
  var midClassGroup_np = [];
  var midClassGroup_np_c = [];
  var midClassGroup_p = [];
  var midClassGroup_p_c = [];
  var smallProduct;
  var i, j, k, l;
  var payload;

  //event function
  function handle_smallProductNP_change(midClassName, smallProductName) {
    payload = new Object();
    payload.middleProductName = midClassName;
    payload.smallProductName = smallProductName;
    payload.smallPrice = 0;
    payload.amount = 0;
    payload.onlyOne = true;

    store.dispatch({
      type: "UPDATE_MIDSMALL_INFO",
      payload: payload,
    });
  }

  function handle_smallProductP_change(
    midClassName,
    smallProductName,
    smallPrice,
    value
  ) {
    payload = new Object();
    payload.middleProductName = midClassName;
    payload.smallProductName = smallProductName;
    payload.smallPrice = smallPrice;
    payload.amount = value;
    payload.onlyOne = false;

    store.dispatch({
      type: "UPDATE_MIDSMALL_INFO",
      payload: payload,
    });
  }

  //display function
  for (i = 0; i < props.data.length; i++) {
    for (j = 0; j < props.data[i].product.length; j++) {
      if (props.data[i].product[j].mainProductName == props.mainProductName) {
        for (k = 0; k < props.data[i].product[j].productMiddle.length; k++) {
          if (
            props.data[i].product[j].productMiddle[k].productSmall.find(
              findSmallPrice
            ) == undefined
          ) {
            for (
              l = 0;
              l < props.data[i].product[j].productMiddle[k].productSmall.length;
              l++
            ) {
              smallProduct = (
                <SmallproductNP_S
                  smallProductName={
                    props.data[i].product[j].productMiddle[k].productSmall[l]
                      .smallProductName
                  }
                />
              );

              midClass_np.push(smallProduct);
            }
          } else {
            for (
              l = 0;
              l < props.data[i].product[j].productMiddle[k].productSmall.length;
              l++
            ) {
              var price_t = findSmallPrice_T(
                props.productMiddle,
                props.data[i].product[j].productMiddle[k].middleProductName,
                props.data[i].product[j].productMiddle[k].productSmall[l]
                  .smallProductName
              );
              smallProduct = (
                <SmallproductP_S
                  smallProductName={
                    props.data[i].product[j].productMiddle[k].productSmall[l]
                      .smallProductName
                  }
                  smallPrice={
                    props.data[i].product[j].productMiddle[k].productSmall[l]
                      .smallPrice
                  }
                  middleProductName={
                    props.data[i].product[j].productMiddle[k].middleProductName
                  }
                  price_t={price_t}
                  handle_smallProductP_change={handle_smallProductP_change}
                />
              );
              midClass_p.push(smallProduct);
            }
          }
          if (
            midClassGroup_np_c.find(
              findMiddleProductName,
              props.data[i].product[j].productMiddle[k].middleProductName
            ) == undefined
          ) {
            midClassGroup_np.push(midClass_np);

            if (midClass_np.length > 0) {
              midClassGroup_np_c.push(
                props.data[i].product[j].productMiddle[k].middleProductName
              );
            }
          }

          midClass_np = [];

          if (
            midClassGroup_p_c.find(
              findMiddleProductName,
              props.data[i].product[j].productMiddle[k].middleProductName
            ) == undefined
          ) {
            midClassGroup_p.push(midClass_p);

            if (midClass_p.length > 0) {
              midClassGroup_p_c.push(
                props.data[i].product[j].productMiddle[k].middleProductName
              );
            }
          }
          midClass_p = [];
        }
      }
    }
  }

  var smallproductGroupNP = [];
  var smallproductGroupP = [];

  for (i = 0; i < midClassGroup_np.length; i++) {
    var smallproductNP = (
      <SmallproductNP
        middleProductName={midClassGroup_np_c[i]}
        handle_smallProductNP_change={handle_smallProductNP_change}
      >
        {midClassGroup_np[i]}
      </SmallproductNP>
    );

    smallproductGroupNP.push(smallproductNP);
  }

  for (i = 0; i < midClassGroup_p.length; i++) {
    var smallproductP = (
      <SmallproductP middleProductName={midClassGroup_p_c[i]}>
        {midClassGroup_p[i]}
      </SmallproductP>
    );

    smallproductGroupP.push(smallproductP);
  }

  return (
    <div>
      <SmallproductNP_container>{smallproductGroupNP}</SmallproductNP_container>
      <SmallproductP_container>{smallproductGroupP}</SmallproductP_container>
    </div>
  );
}

const mapStateToProps_MidSmallProduct = (state) => {
  return {
    data: state.productListReducer,
    mainProductName: state.actionReducer.productName,
    productMiddle: state.productDetailReducer.productMiddle,
  };
};

MidSmallProduct = connect(mapStateToProps_MidSmallProduct)(MidSmallProduct);

function SmallproductP_S(props) {
  const [value, setValue] = useState(0);

  function handle_add() {
    var val = value;
    val++;
    if (val > 3) {
      val = 3;
    }
    setValue(val);
    props.handle_smallProductP_change(
      props.middleProductName,
      props.smallProductName,
      props.smallPrice,
      val
    );
  }

  function handle_dec() {
    var val = value;
    val--;
    if (val < 0) {
      val = 0;
    }
    setValue(val);
    props.handle_smallProductP_change(
      props.middleProductName,
      props.smallProductName,
      props.smallPrice,
      val
    );
  }

  var price_t_s = "$" + (props.price_t / 100).toFixed(2).toString();
  return (
    <Row style={{ marginTop: "4%" }}>
      <Col xs={10}>{props.smallProductName}</Col>

      <Col xs={8} style={{ marginLeft: "1%" }}>
        <Button style={{ marginRight: "2%" }} onClick={handle_dec}>
          -
        </Button>
        {value}
        <Button
          type="primary "
          style={{ marginLeft: "2%" }}
          onClick={handle_add}
        >
          +
        </Button>
      </Col>
      <Col xs={4} style={{ marginLeft: "4%" }}>
        ${(props.smallPrice / 100).toFixed(2).toString()}
      </Col>
    </Row>
  );
}

function SmallproductNP_S(props) {
  return (
    <Radio.Button value={props.smallProductName}>
      {props.smallProductName}
    </Radio.Button>
  );
}

function SmallproductNP(props) {
  function handle_smallProductNP_change(e) {
    props.handle_smallProductNP_change(props.middleProductName, e.target.value);
  }
  return (
    <div style={{ marginTop: "2%" }}>
      <div style={{ diaplay: "inline" }}>
        <span style={{ marginRight: "2%" }}>{props.middleProductName}</span>
        <Radio.Group onChange={handle_smallProductNP_change}>
          {props.children}
        </Radio.Group>
      </div>
    </div>
  );
}

function SmallproductP(props) {
  return (
    <div style={{ marginTop: "2%" }}>
      <h3>{props.middleProductName}</h3>
      {props.children}
    </div>
  );
}

function SmallproductNP_container(props) {
  return <div>{props.children}</div>;
}

function SmallproductP_container(props) {
  return <div>{props.children}</div>;
}

////////////////////////////////////////////////////////////////////////////////////the function used to display main product area

function MainProduct_container() {
  return (
    <div>
      <div style={{ marginLeft: "20%" }}>
        <ProductIntro />
      </div>
      <div style={{ marginTop: "10%" }}>
        <MainProductAmountPrice />
      </div>
    </div>
  );
}

function ProductIntro(props) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    /* console.log("2222");
    checkPic(props.productList, props.shopAddress, props.version, setLoading);
    setLoading(props.productList.length > 0 ? false : true);*/
  }, []);

  if (props.productList.length > 0) {
    var product_detail = props.productList.map((item) => {
      for (var i = 0; i < item.product.length; i++) {
        if (item.product[i].mainProductName == props.mainProductName) {
          return item.product[i];
        }
      }
    });

    product_detail = product_detail.filter((item) => {
      return item != undefined;
    });

    var price =
      "Price：" + "$" + (product_detail[0].price / 100).toFixed(2).toString();
    return (
      <div>
        <Spin spinning={loading}>
          <img src={product_detail[0].picFile} style={{ width: "70%" }} />

          <h3>{product_detail[0].mainProductName}</h3>
          <h3>{product_detail[0].productIntro}</h3>
          <h3>{price}</h3>
        </Spin>
      </div>
    );
  } else {
    return <Spin spinning={loading}></Spin>;
  }
}

const mapStateToProps_ProductDetail = (state) => {
  return {
    productList: state.productListReducer,
    mainProductName: state.actionReducer.productName,
    shopAddress: state.userInfoReducer.shopAddress,
    version: state.userInfoReducer.productVersion,
  };
};

ProductIntro = connect(mapStateToProps_ProductDetail)(ProductIntro);

///////////////////////////////////////////////////////////////

function MainProductAmountPrice(props) {
  const [amount, setAmount] = useState(0);
  const [isVisble, setVisble] = useState(false);
  const [msg1, setMsg1] = useState("");
  const [msg2, setMsg2] = useState("");

  function handle_cancel() {
    setVisble(false);
  }

  function handle_dec() {
    var val = amount;
    val--;
    if (val < 0) {
      val = 0;
    }
    setAmount(val);
    store.dispatch({
      type: "UPDATE_MAINPRODUCT_AMOUNT",
      amount: val,
    });
  }
  function handle_add() {
    var val = amount;
    val++;

    if (
      val +
        countTotalAmountByProductName(
          props.orderProduct,
          props.productDetail.productName
        ) >
      props.productDetail.stock
    ) {
      setMsg1("库存不够,无法增加购买");
      setMsg2("Insufficient inventory to increase purchases");
      setVisble(true);
      return;
    }
    setAmount(val);
    store.dispatch({
      type: "UPDATE_MAINPRODUCT_AMOUNT",
      amount: val,
    });
  }

  return (
    <div>
      <span style={{ fontWeight: "600" }}>Quantity：</span>
      <Button style={{ marginRight: "3%" }} onClick={handle_dec}>
        -
      </Button>
      {amount}
      <Button type="primary " style={{ marginLeft: "3%" }} onClick={handle_add}>
        +
      </Button>
      <Modal
        title="Message"
        visible={isVisble}
        onOk={handle_cancel}
        onCancel={handle_cancel}
        width={400}
        closable={false}
        centered={true}
        maskClosable={false}
        okText="OK"
        cancelText="Cancel"
      >
        <p>{msg1}</p>
        <p>{msg2}</p>
      </Modal>
    </div>
  );
}

const mapStateToProps_MainProductAmountPrice = (state) => {
  return {
    productDetail: state.productDetailReducer,
    orderProduct: state.orderInfoReducer.orderProduct,
  };
};

MainProductAmountPrice = connect(mapStateToProps_MainProductAmountPrice)(
  MainProductAmountPrice
);

/////////////////////////////////////////////////////////////////////////////////////////////////the function  used to display productList area

import { Helmet } from "react-helmet";

export function Home_ProductList() {
  return (
    <div>
      <Helmet>
        <title>World Tea,Bubble Tea</title>
        <meta
          name="description"
          content="Bubble Tea,FRESH FRULT TEA,TOP 3 FRUIT TEA,FRESH FRULT WITH PROBIOTICS,珍珠奶茶,水果茶,奶茶,世界茶饮,莫奈花园下午茶"
        />
      </Helmet>
      <ListCatalog />
      <ProductByClass />
    </div>
  );
}

//add all product
function addAllProduct(data) {
  var allProduct = new Object();

  allProduct.catalogName = "All Product";

  var data1 = data.slice(0);

  data1.push(allProduct);

  return data1;
}

function findCatalogName(inputProduct) {
  return inputProduct.catalogName == this;
}

function ListCatalog(props) {
  var data = addAllProduct(props.data);

  if (props.data.find(findCatalogName, props.className) == undefined) {
    store.dispatch({
      type: "UPDATE_CLASS_INFO",
      className: "All Product",
    });
  }

  function handle_click(e) {
    store.dispatch({
      type: "UPDATE_CLASS_INFO",
      className: e.target.textContent,
    });
  }

  const catalig_list = data.map((item, index) => {
    return (
      <li
        key={index}
        style={{
          marginRight: "5%",
          fontSize: "120%",

          display: "inline-block",
        }}
      >
        <a
          style={{
            color: item.catalogName == props.className ? "red" : "black",
          }}
          onClick={handle_click}
        >
          {item.catalogName}
        </a>
      </li>
    );
  });
  return (
    <div
      style={{
        zIndex: "20",
        width: "100%",
      }}
    >
      <ul
        style={{
          whiteSpace: "nowrap",
          listStyle: "none",
          overflowX: "auto",

          marginLeft: "2%",
        }}
      >
        {catalig_list}
      </ul>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    data: state.productListReducer,
    className: state.actionReducer.className,
  };
};

ListCatalog = connect(mapStateToProps)(ListCatalog);

function ProductCard(props) {
  var price = "Price：" + "$" + (props.price / 100).toFixed(2).toString();

  function card_handle_click() {
    props.handle_click(props.mainProductName, props.price, props.productIntro);
  }

  return (
    <Col xs={24} sm={12} md={6} lg={6} xl={6} style={{ marginTop: "5%" }}>
      <Card
        hoverable
        style={{ width: "80%" }}
        cover={
          <img src={props.picFile} style={{ width: "100%", height: "100%" }} />
        }
        onClick={card_handle_click}
        onDoubleClick={card_handle_click}
      >
        <h3>{props.mainProductName}</h3>
        <h3 style={{ marginRight: "2%" }}>{props.productIntro}</h3>
        <h3>{price}</h3>
      </Card>
    </Col>
  );
}

function ProductCard_container(props) {
  return (
    <div style={{ marginLeft: "5%" }}>
      <Row gutter={2}> {props.children}</Row>
    </div>
  );
}

function findProductName(inputProduct) {
  return inputProduct.mainProductName == this.mainProductName;
}
/*puductList_o.push(props.data[i].product[j]);*/

var mainProductName_t, price_t, productIntro_t;

import { readLogin, deleteLogin } from "./component_login";
import { object } from "prop-types";

function ProductByClass(props) {
  function goShopping(
    mainProductName,
    price,
    productIntro,
    shopAddress,
    data,
    setMsg1,
    setMsg2,
    setProductDetailVisible
  ) {
    var product = new Object();
    product.productName = mainProductName;
    product.productIntro = productIntro;
    product.price = price;
    product.amount = 0;
    product.totalPrice = 0;

    store.dispatch({
      type: "UPDATE_PRODUCTDETAIL_INFO",
      product: product,
    });

    store.dispatch({
      type: "UPDATE_SELECT_INFO",
      productName: mainProductName,
    });
    /*history.push("/productDetail");*/

    var req = new Object();
    req.shopAddress = shopAddress;
    req.mainProductName = mainProductName;

    api.getAcceptOrder(req).then((result) => {
      /*result.status = "ok"; //////////////////////////////////////////////////for test,must be delete
      result.stock = 999999; /////////////////////////////*/

      if (result.status == "ok") {
        store.dispatch({
          type: "UPDATE_MAINPRODUCT_STOCK",
          stock: result.stock,
        });

        store.dispatch({
          type: "UPDATE_PRODUCT_INFO",
          payload: updateProductListAmount(data, mainProductName, result.stock),
        });
        if (result.stock > 0) {
          setProductDetailVisible(true);
        } else {
          setMsg1("该产品没有库存!");
          setMsg2("This product is not in stock!");
          setVisble(true);
        }
      } else {
        setMsg1("现在不是营业时间");
        setMsg2("It is not business hours");
        setVisble(true);
      }
    });
  }

  function handle_click(mainProductName, price, productIntro) {
    mainProductName_t = mainProductName;
    price_t = price;
    productIntro_t = productIntro;

    if (props.userCode.charAt(0) == "T" && props.productName == "none") {
      setRegisterVisble(true);
    } else {
      goShopping(
        mainProductName,
        price,
        productIntro,
        props.shopAddress,
        props.data,
        setMsg1,
        setMsg2,
        setProductDetailVisible
      );
    }
  }

  function handle_continue() {
    setRegisterVisble(false);
    goShopping(
      mainProductName_t,
      price_t,
      productIntro_t,
      props.shopAddress,
      props.data,
      setMsg1,
      setMsg2,
      setProductDetailVisible
    );
  }

  function handle_register() {
    history.push("/login");
    setRegisterVisble(false);
  }

  function onClose() {
    setProductDetailVisible(false);
  }

  function handle_cancel() {
    setVisble(false);
  }

  async function handleLogin() {
    var login = readLogin();
    if (login == null) {
      console.log("no storage");
      login = new Object();
      login.email = "";
      login.password = "";
    }

    if (login.password == false) {
      login.password = "";
    }

    login.password = api.encrypt(login.password);

    var result = await api.getUserInfo(login);

    store.dispatch({
      type: "UPDATE_USER_INFO",
      payload: result,
    });

    store.dispatch({
      type: "UPDATE_SELECT_INFO",
      productName: "none",
    });

    checkPic(props.data, result.shopAddress, props.version, setLoading);
    setLoading(props.data.length > 0 ? false : true);

    if (result.status != "success") {
      deleteLogin();
    }
  }

  const [loading, setLoading] = useState(true);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [isVisble, setVisble] = useState(false);
  const [isRegisterVisble, setRegisterVisble] = useState(false);
  const [msg1, setMsg1] = useState("");
  const [msg2, setMsg2] = useState("");

  useEffect(() => {
    //forbidden back
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });

    if (props.userCode.charAt(0) == "T" || props.userCode.charAt(0) == "C") {
      checkPic(props.data, props.shopAddress, props.version, setLoading);
      setLoading(props.data.length > 0 ? false : true);
    } else {
      handleLogin();
    }
  }, []);

  //ready to render
  var puductList = [];
  var puductList_o = [];

  for (var i = 0; i < props.data.length; i++) {
    if (
      props.data[i].catalogName == props.catalogName ||
      props.catalogName == "All Product"
    ) {
      for (var j = 0; j < props.data[i].product.length; j++) {
        var productCard = (
          <ProductCard
            price={props.data[i].product[j].price}
            picFile={props.data[i].product[j].picFile}
            mainProductName={props.data[i].product[j].mainProductName}
            productIntro={props.data[i].product[j].productIntro}
            handle_click={handle_click}
          />
        );
        if (
          puductList_o.find(findProductName, props.data[i].product[j]) ==
          undefined
        ) {
          puductList.push(productCard);
          puductList_o.push(props.data[i].product[j]);
        }
      }
    }
  }

  return (
    <Spin spinning={loading}>
      <div>
        <ProductCard_container>{puductList}</ProductCard_container>
        <Modal
          title="Choose Specification"
          visible={productDetailVisible}
          onOk={onClose}
          onCancel={onClose}
          width={600}
          closable={true}
          centered={true}
          maskClosable={false}
          bodyStyle={sectionStyle}
          footer={null}
          destroyOnClose={true}
        >
          <Home_productDetail handle_close={onClose} />
        </Modal>
        <Modal
          title="Message"
          visible={isVisble}
          onOk={handle_cancel}
          onCancel={handle_cancel}
          width={300}
          closable={false}
          centered={true}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          <p> {msg1}</p>
          <p> {msg2}</p>
        </Modal>
        <Modal
          title="Message"
          visible={isRegisterVisble}
          onOk={handle_register}
          onCancel={handle_continue}
          width={400}
          closable={false}
          centered={true}
          maskClosable={false}
          okText="Sign in"
          cancelText="Continue"
        >
          <p>建立账户并登陆能享受积分回馈</p>
          <p>Create account and sign in to enjoy points rewards</p>
        </Modal>
      </div>
    </Spin>
  );
}

const mapStateToProps_ProductList = (state) => {
  return {
    data: state.productListReducer,
    catalogName: state.actionReducer.className,
    productName: state.actionReducer.productName,
    shopAddress: state.userInfoReducer.shopAddress,
    userCode: state.userInfoReducer.userCode,
    version: state.userInfoReducer.productVersion,
  };
};

ProductByClass = connect(mapStateToProps_ProductList)(ProductByClass);
