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
import home from "../../images/home.svg";
import cart from "../../images/cart.svg";

import menu from "../../images/menu.svg";
import order from "../../images/order.png";
import cash from "../../images/cash.svg";

import api from "../api";
import { Menu_1 } from "./component_menu";

import bg1 from "../../images/bg1.jpg";

var sectionStyle = {
  width: "100%",
  height: "100%",
  // makesure here is String确保这里是一个字符串，以下是es6写法
  backgroundImage: `url(${bg1})`,
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
  function findMiddleProduct(input) {
    return input.middleProductName == this;
  }

  if (productDetail.amount == 0) {
    return "主产品数量至少为1";
  }

  //counter 加料
  var count = 0;
  for (var i = 0; i < productDetail.productMiddle.length; i++) {
    if (productDetail.productMiddle[i].middleProductName == "加料") {
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
    return "加料总和不能超过3份,请重新选择";
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
        return midProduct[k] + "必须选择";
      }
    }
  }

  return "success";
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

export async function checkPic(data, shopAddress, func) {
  var result1 = true;

  if (data != null && data != undefined) {
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

  if (result1 == false) {
    store.dispatch({
      type: "UPDATE_PRODUCT_INFO",
      payload: [],
    });
    func(true);
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

export function Home_header(props) {
  function handle_click() {
    history.push("/cart");
  }
  return (
    <Affix offsetTop={0}>
      <div style={{ position: "relative" }}>
        <div
          offsetTop={30}
          style={{ backgroundColor: "white", marginLeft: "5%" }}
        >
          <Menu_1 />
        </div>
        <div style={{ position: "absolute", top: "2%", left: "85%" }}>
          <Badge count={props.orderInfo.orderProduct.length}>
            <a onClick={handle_click}>
              <img src={cart} style={{ width: "32px" }} />
            </a>
          </Badge>
        </div>
        <Row style={{ marginBottom: "5%", zIndex: "-10" }}>
          <Col xs={8}>
            <img src={b_main} style={{ width: "103%" }} />
          </Col>
          <Col xs={16}>
            <Carousel autoplay>
              <div>
                <img src={b_1} style={{ width: "101%" }} />
              </div>
              <div>
                <img src={b_2} style={{ width: "104%" }} />
              </div>
              <div>
                <img src={b_3} style={{ width: "102%" }} />
              </div>
              <div>
                <img src={b_4} style={{ width: "102%" }} />
              </div>
              <div>
                <img src={b_5} style={{ width: "101%" }} />
              </div>
            </Carousel>
          </Col>
        </Row>
      </div>
    </Affix>
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
  function handle_home() {
    history.push("/home");
  }

  function handle_add_cart() {
    var result = checkValidate(props.productList, props.productDetail);
    if (result == "success") {
      addToCart(props.productDetail);

      notification.open({
        message: "成功加入购物车",
        description: "成功加入购物车.您可继续选购或前往购物车结账",
        duration: 2,
      });

      props.handle_close();
    } else {
      notification.open({
        message: "无法加入购物车",
        description: result,
        duration: 2,
      });
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
            <Col xs={4}>
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
          <h3>请选择规格:</h3>
          <MidSmallProduct />
          <Divider />
          <MidSmallPrice />
        </div>
      </div>
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
  var price_s = "总价格：$" + (price / 100).toFixed(2).toString();

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
      <Col xs={8}>
        {props.smallProductName}:$
        {(props.smallPrice / 100).toFixed(2).toString()}
      </Col>

      <Col xs={10} style={{ marginLeft: "5%" }}>
        <Button style={{ marginRight: "5%" }} onClick={handle_dec}>
          -
        </Button>
        {value}
        <Button
          type="primary "
          style={{ marginLeft: "5%" }}
          onClick={handle_add}
        >
          +
        </Button>
      </Col>
      <Col xs={4} style={{ marginLeft: "0%" }}>
        {price_t_s}
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
      <div style={{ marginLeft: "30%" }}>
        <ProductIntro />
      </div>
      <div style={{ marginTop: "10%" }}>
        <MainProductAmountPrice />
      </div>
    </div>
  );
}

function ProductIntro(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPic(props.productList, props.shopAddress, setLoading);
    setLoading(props.productList.length > 0 ? false : true);
  });

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
      "价格：" + "$" + (product_detail[0].price / 100).toFixed(2).toString();
    return (
      <div>
        <Spin spinning={loading}>
          <img
            src={product_detail[0].picFile}
            style={{ width: "30%", height: "30%" }}
          />

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
  };
};

ProductIntro = connect(mapStateToProps_ProductDetail)(ProductIntro);

///////////////////////////////////////////////////////////////

function MainProductAmountPrice(props) {
  const [amount, setAmount] = useState(0);
  const [isVisble, setVisble] = useState(false);
  const [msg, setMsg] = useState("");

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
      var msg_d = "库存不够，无法再增加购买";
      setMsg(msg_d);
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
      <span style={{ fontWeight: "600" }}>数量：</span>
      <Button style={{ marginRight: "3%" }} onClick={handle_dec}>
        -
      </Button>
      {amount}
      <Button type="primary " style={{ marginLeft: "3%" }} onClick={handle_add}>
        +
      </Button>
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
export function Home_ProductList() {
  return (
    <div>
      <ListCatalog />
      <ProductByClass />
    </div>
  );
}

//add all product
function addAllProduct(data) {
  var allProduct = new Object();

  allProduct.catalogName = "全部产品";

  var data1 = data.slice(0);

  data1.push(allProduct);

  return data1;
}

function ListCatalog(props) {
  var data = addAllProduct(props.data);

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
          fontSize: "150%",

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
        overflow: "hidden",

        zIndex: "20",
        width: "100%",
      }}
    >
      <ul
        style={{
          overflow: "Scroll",
          whiteSpace: "nowrap",
          listStyle: "none",
          overflowX: "auto",
          width: "auto",
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
  var price = "价格：" + "$" + (props.price / 100).toFixed(2).toString();

  function card_handle_click() {
    props.handle_click(props.mainProductName, props.price);
  }

  return (
    <Col xs={12} sm={12} md={12} lg={12} xl={6} style={{ marginTop: "5%" }}>
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
        <h4 style={{ marginLeft: "5%", marginRight: "2%" }}>
          {props.productIntro}
        </h4>
        <h5>{price}</h5>
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
function ProductByClass(props) {
  //when user click product
  function handle_click(mainProductName, price) {
    var product = new Object();
    product.productName = mainProductName;
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
    req.shopAddress = props.shopAddress;
    req.mainProductName = mainProductName;

    api.getAcceptOrder(req).then((result) => {
      if (result.status == "ok") {
        store.dispatch({
          type: "UPDATE_MAINPRODUCT_STOCK",
          stock: result.stock,
        });

        store.dispatch({
          type: "UPDATE_PRODUCT_INFO",
          payload: updateProductListAmount(
            props.data,
            mainProductName,
            result.stock
          ),
        });
        if (result.stock > 0) {
          setProductDetailVisible(true);
        } else {
          setMsg("该产品没有库存，请选购其它产品");
          setVisble(true);
        }
      } else {
        setMsg("营业时间未到或商家未营业，请换个时间选购");
        setVisble(true);
      }
    });
  }

  function onClose() {
    setProductDetailVisible(false);
  }

  function handle_cancel() {
    setVisble(false);
  }

  const [loading, setLoading] = useState(true);
  const [productDetailVisible, setProductDetailVisible] = useState(false);
  const [isVisble, setVisble] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    //forbidden back
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });
    checkPic(props.data, props.shopAddress, setLoading);
    setLoading(props.data.length > 0 ? false : true);
  });

  //ready to render
  var puductList = [];
  var puductList_o = [];

  for (var i = 0; i < props.data.length; i++) {
    if (
      props.data[i].catalogName == props.catalogName ||
      props.catalogName == "全部产品"
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
          title="选择规格"
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
    </Spin>
  );
}

const mapStateToProps_ProductList = (state) => {
  return {
    data: state.productListReducer,
    catalogName: state.actionReducer.className,
    shopAddress: state.userInfoReducer.shopAddress,
  };
};

ProductByClass = connect(mapStateToProps_ProductList)(ProductByClass);
