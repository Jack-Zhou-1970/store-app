import React from "react";

import { Layout } from "antd";

const { Header, Content } = Layout;

import { List } from "antd";
import { Row, Col } from "antd";

//redux
import { store } from "../app";

import { connect } from "react-redux";

export function Home_container(props) {
  return (
    <Layout>
      <Header style={{ backgroundColor: "white" }}>{props.header}</Header>
      <Content>
        <ListCatalog />
      </Content>
    </Layout>
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
