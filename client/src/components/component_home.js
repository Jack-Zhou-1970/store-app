import React from "react";

import { List, Card, Button } from "antd";
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
      <Col xs={12}>
        <ProductIntro />
      </Col>
      <Col xs={12}>
        <h3>请选择规格</h3>
      </Col>
    </Row>
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
    props.handle_click(props.mainProductName);
  }

  return (
    <Col xs={12} sm={12} md={12} lg={12} xl={6}>
      <Card
        hoverable
        style={{ width: "50%" }}
        cover={<img src={props.picFile} />}
        onClick={card_handle_click}
      >
        <h3>{props.mainProductName}</h3>
        <h4 style={{ marginLeft: "5%", marginRight: "5%" }}>
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

function ProductByClass(props) {
  //when user click product
  function handle_click(mainProductName) {
    store.dispatch({
      type: "UPDATE_SELECT_INFO",
      productName: mainProductName,
    });
    history1.push("/productDetail");
  }

  //ready to render
  const card_list = props.data.map((item) => {
    if (
      item.catalogName == props.catalogName ||
      props.catalogName == "全部产品"
    ) {
      for (var i = 0; i < item.product.length; i++) {
        return (
          <ProductCard
            key={i}
            price={item.product[i].price}
            picFile={item.product[i].picFile}
            mainProductName={item.product[i].mainProductName}
            productIntro={item.product[i].productIntro}
            handle_click={handle_click}
          />
        );
      }
    }
  });

  return <ProductCard_container>{card_list}</ProductCard_container>;
}

const mapStateToProps_ProductList = (state) => {
  return {
    data: state.productListReducer,
    catalogName: state.actionReducer.className,
  };
};

ProductByClass = connect(mapStateToProps_ProductList)(ProductByClass);
