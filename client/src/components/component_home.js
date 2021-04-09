import React from "react";

import { List, Card, Button, Slider, Radio } from "antd";
import { Row, Col } from "antd";

import { history1 } from "../history";

//redux
import { store } from "../app";

import { connect } from "react-redux";

//the function used to display product header

export function Home_header(props) {
  return <div>This is header</div>;
}

//the function used to display product detail

export function Home_productDetail() {
  return (
    <Row style={{ marginLeft: "5%", marginTop: "5%" }}>
      <Col xs={10}>
        <ProductIntro />
      </Col>
      <Col xs={12} style={{ marginLeft: "2%" }}>
        <h3>请选择规格:</h3>
        <MidSmallProduct />
      </Col>
    </Row>
  );
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

//the function used to display small product
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

  console.log(props.productMiddle);

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
      <h5>{price}</h5>
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

//the function  used to display productList area
export function Home_ProductList() {
  return (
    <div>
      <ListCatalog />
      <ProductByClass />
    </div>
  );
}

function ListCatalog(props) {
  return (
    <List
      grid={{ gutter: 2, column: 8 }}
      style={{ marginLeft: "10%" }}
      dataSource={props.data}
      renderItem={(item) => (
        <List.Item>
          <div>{item.catalogName}</div>
        </List.Item>
      )}
    />
  );
}

const mapStateToProps = (state) => {
  return {
    data: state.productListReducer,
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
