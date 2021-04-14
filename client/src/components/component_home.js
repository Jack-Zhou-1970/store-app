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
} from "antd";
import { Row, Col } from "antd";

import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

import cart from "../../images/cart.png";
import home from "../../images/home.png";

const err = (msg) => {
  message.error(msg, 2);
};

//the function used to display product header

export function Home_header(props) {
  function handle_click() {
    history.push("/cart");
  }
  return (
    <div style={{ height: "200px", position: "relative" }}>
      <Affix
        offsetTop={30}
        style={{ position: "absolute", top: "10%", left: "80%" }}
      >
        <div style={{ width: "50%" }}>
          <Badge count={props.orderInfo.orderProduct.length}>
            <a onClick={handle_click}>
              <img src={cart} style={{ width: "100%", zIndex: "10" }} />
            </a>
          </Badge>
        </div>
      </Affix>
    </div>
  );
}

const mapStateToProps_Home_header = (state) => {
  return {
    orderInfo: state.orderInfoReducer,
  };
};

Home_header = connect(mapStateToProps_Home_header)(Home_header);

//the function used to display product detail

export function Home_productDetail() {
  return (
    <div style={{ marginLeft: "5%", marginTop: "5%" }}>
      <div>
        <MainProduct_container />
      </div>
      <div style={{ marginTop: "5%" }}>
        <h3>请选择规格:</h3>
        <MidSmallProduct />
        <MidSmallPrice />
      </div>
    </div>
  );
}

//the function  below used to display mid small area

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

function checkValidate(productDetail) {
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

function MidSmallPrice(props) {
  var price = calTotalPrice(props.productDetail);
  var price_s = "总价格：$" + (price / 100).toString();

  function handle_click1() {
    message.config({
      top: 500,
    });
    var result = checkValidate(props.productDetail);
    if (result == "success") {
      addToCart(props.productDetail);
      history.push("/home");
    } else {
      err(result);
    }
  }

  function handle_click2() {
    history.push("/home");
  }
  return (
    <div style={{ marginTop: "2%" }}>
      <h3>{price_s}</h3>
      <Affix
        offsetTop={50}
        style={{ position: "absolute", top: "20%", left: "55%" }}
      >
        <div style={{ marginTop: "5%", marginLeft: "70%" }}>
          <a onClick={handle_click1}>
            <img src={cart} style={{ width: "70%" }} />
          </a>
          <a onClick={handle_click2}>
            <img src={home} style={{ width: "70%" }} />
          </a>
        </div>
      </Affix>
    </div>
  );
}

const mapStateToProps_totalPrice = (state) => {
  return {
    productDetail: state.productDetailReducer,
  };
};

MidSmallPrice = connect(mapStateToProps_totalPrice)(MidSmallPrice);

////////////////////////////////////////////

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

//the function used to display mid small product
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
  function handle_smallProductP_change(value) {
    props.handle_smallProductP_change(
      props.middleProductName,
      props.smallProductName,
      props.smallPrice,
      value
    );
  }

  var price_t_s = "$" + (props.price_t / 100).toString();
  return (
    <Row style={{ marginTop: "4%" }}>
      <Col xs={4}>{props.smallProductName}</Col>

      <Col xs={12}>
        <Slider
          style={{ marginLeft: "0%" }}
          defaultValue={0}
          min={0}
          max={3}
          step={1}
          dots={true}
          onChange={handle_smallProductP_change}
        />
      </Col>
      <Col xs={4} style={{ marginLeft: "2%" }}>
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
        <span style={{ marginRight: "15%" }}>{props.middleProductName}</span>
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
/////////////////////////////////////////////////////////////

/////////the function used to display main product area

function MainProduct_container() {
  return (
    <div>
      <div style={{ marginLeft: "30%" }}>
        <ProductIntro />
      </div>
      <MainProductAmountPrice />
    </div>
  );
}

function ProductIntro(props) {
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

  var price = "价格：" + "$" + (product_detail[0].price / 100).toString();
  return (
    <div>
      <img
        src={product_detail[0].picFile}
        style={{ width: "30%", height: "30%" }}
      />

      <h3>{product_detail[0].mainProductName}</h3>
      <h3>{product_detail[0].productIntro}</h3>
      <h3>{price}</h3>
    </div>
  );
}

const mapStateToProps_ProductDetail = (state) => {
  return {
    productList: state.productListReducer,
    mainProductName: state.actionReducer.productName,
  };
};

ProductIntro = connect(mapStateToProps_ProductDetail)(ProductIntro);

function MainProductAmountPrice() {
  function handleChange(value) {
    store.dispatch({
      type: "UPDATE_MAINPRODUCT_AMOUNT",
      amount: Number(value),
    });
  }

  return (
    <Row style={{ marginTop: "2%" }}>
      <Col xs={4}>
        <h3>数量:</h3>
      </Col>
      <Col xs={7}>
        <Select
          style={{ width: "80%" }}
          placeholder="0杯"
          onChange={handleChange}
        >
          <Option value="0">0杯</Option>
          <Option value="1">1杯</Option>
          <Option value="2">2杯</Option>
          <Option value="3">3杯</Option>
          <Option value="4">4杯</Option>
          <Option value="5">5杯</Option>
        </Select>
      </Col>
    </Row>
  );
}

//the function  used to display productList area
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
  return (
    <List
      grid={{ gutter: 1, column: 6 }}
      style={{ marginLeft: "10%" }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item onClick={handle_click}>
          <div
            style={{
              color: item.catalogName == props.className ? "red" : "black",
            }}
          >
            {item.catalogName}
          </div>
        </List.Item>
      )}
    />
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
  var price = "价格：" + "$" + (props.price / 100).toString();

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
    history.push("/productDetail");
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            key={j}
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
      <ProductCard_container>{puductList}</ProductCard_container>{" "}
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
