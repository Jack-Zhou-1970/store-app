import React from "react";

import { List, Card, Button, Slider, Radio, Select, message } from "antd";
import { Row, Col } from "antd";

import { history1 } from "../history";
import history from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

const err = (msg) => {
  message.error(msg, 2);
};

//the function used to display product header

export function Home_header(props) {
  function handle_click() {
    console.log(store.getState());
    history.push("/cart");
  }
  return (
    <div>
      <Button type="primary" onClick={handle_click}>
        到购物车
      </Button>
    </div>
  );
}

//the function used to display product detail

export function Home_productDetail() {
  return (
    <Row style={{ marginLeft: "5%", marginTop: "5%" }}>
      <Col xs={10}>
        <MainProduct_container />
      </Col>
      <Col xs={12} style={{ marginLeft: "2%" }}>
        <h3>请选择规格:</h3>
        <MidSmallProduct />
        <MidSmallPrice />
      </Col>
    </Row>
  );
}

//the functio  below used to display mid small area

//the funcio  used to display total price  and two button

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
  return smallTotalPrice + productDetail.totalPrice;
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
      history1.push("/");
    } else {
      err(result);
    }
  }

  function handle_click2() {
    history1.push("/");
  }
  return (
    <div style={{ marginTop: "5%" }}>
      <h3>{price_s}</h3>
      <Row style={{ marginTop: "10%", marginLeft: "10%" }}>
        <Col xs={10}>
          <Button type="primary" onClick={handle_click1}>
            添加到购物车
          </Button>
        </Col>
        <Col xs={10}>
          <Button type="primary" onClick={handle_click2}>
            重新购物
          </Button>
        </Col>
      </Row>
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

  var price = "单份$" + (props.smallPrice / 100).toString();
  var price_t_s = "$" + (props.price_t / 100).toString();
  return (
    <Row style={{ marginTop: "4%" }}>
      <Col xs={6}>
        <h4>
          {props.smallProductName}
          {price}
        </h4>
      </Col>

      <Col xs={10}>
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
      <Col xs={4} style={{ marginLeft: "5%" }}>
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
    <div style={{ marginTop: "5%" }}>
      <h3>{props.middleProductName}</h3>
      <Radio.Group onChange={handle_smallProductNP_change}>
        {props.children}
      </Radio.Group>
    </div>
  );
}

function SmallproductP(props) {
  return (
    <div style={{ marginTop: "5%" }}>
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
      <ProductIntro />
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
    <Card hoverable cover={<img src={product_detail[0].picFile} />}>
      <h3>{product_detail[0].mainProductName}</h3>
      <h4 style={{ marginLeft: "5%", marginRight: "5%" }}>
        {product_detail[0].productIntro}
      </h4>
      <h4>{price}</h4>
    </Card>
  );
}

const mapStateToProps_ProductDetail = (state) => {
  return {
    productList: state.productListReducer,
    mainProductName: state.actionReducer.productName,
  };
};

ProductIntro = connect(mapStateToProps_ProductDetail)(ProductIntro);

function MainProductAmountPrice(props) {
  function handleChange(value) {
    store.dispatch({
      type: "UPDATE_MAINPRODUCT_AMOUNT",
      amount: Number(value),
    });
  }

  var price = "价格:" + "$" + (props.totalPrice / 100).toString();
  return (
    <Row style={{ marginTop: "2%" }}>
      <Col xs={4}>
        <h4>数量:</h4>
      </Col>
      <Col xs={8}>
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
      <Col xs={8}>
        <h4>{price}</h4>
      </Col>
    </Row>
  );
}

const mapStateToProps_mainprice = (state) => {
  return {
    totalPrice: state.productDetailReducer.totalPrice,
  };
};

MainProductAmountPrice = connect(mapStateToProps_mainprice)(
  MainProductAmountPrice
);

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
        style={{ width: "50%" }}
        cover={<img src={props.picFile} />}
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
    history1.push("/productDetail");
  }

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

  return <ProductCard_container>{puductList}</ProductCard_container>;
}

const mapStateToProps_ProductList = (state) => {
  return {
    data: state.productListReducer,
    catalogName: state.actionReducer.className,
  };
};

ProductByClass = connect(mapStateToProps_ProductList)(ProductByClass);
