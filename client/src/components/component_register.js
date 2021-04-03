import React from "react";
import { useRef } from "react";

import { Row, Col } from "antd";
import { Form, Input, Button, message, Select, Modal } from "antd";

import history from "../history";
import { store } from "../app";

import api from "../api";

const err1 = () => {
  message.error("该邮箱已经被注册过，请换一个邮箱注册", 2);
};

function RegisterForm(props) {
  const refMail = useRef(null);
  const refPassword = useRef(null);
  const refPasswordC = useRef(null);
  const refPhone = useRef(null);
  const refAddress = useRef(null);
  const refShopAddress = useRef(null);

  function handle_submit() {
    props.handle_submit(
      refMail.current.state.value,
      refPassword.current.state.value,
      refPasswordC.current.state.value,
      refPhone.current.state.value,
      refAddress.current.state.value,
      refShopAddress.current.props.value
    );
  }

  return (
    <Form name="basic" initialValues={{ remember: false }}>
      <Form.Item
        label="邮箱"
        name="username"
        rules={[{ required: true, message: "请输入注册邮箱!" }]}
      >
        <Input style={{ height: "5%" }} ref={refMail} />
      </Form.Item>

      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: "请输入密码!" }]}
      >
        <Input.Password ref={refPassword} />
      </Form.Item>
      <Form.Item
        label="确认密码"
        name="passwordC"
        rules={[{ required: true, message: "请再次输入密码!" }]}
      >
        <Input.Password ref={refPasswordC} />
      </Form.Item>
      <Form.Item
        label="电话"
        name="phone"
        rules={[{ required: true, message: "电话" }]}
      >
        <Input style={{ height: "5%" }} ref={refPhone} />
      </Form.Item>
      <Form.Item
        label="地址"
        name="address"
        rules={[{ required: true, message: "请输入地址" }]}
      >
        <Input style={{ height: "5%" }} ref={refAddress} />
      </Form.Item>

      <Form.Item
        label="自取门店"
        name="shopAddress"
        rules={[{ required: true, message: "选择自取门店!" }]}
      >
        <Select placeholder="选择自取门店" ref={refShopAddress}>
          <Option value="ON">ON</Option>
          <Option value="BC">BC</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button
          style={{ marginLeft: "50%" }}
          type="primary"
          onClick={handle_submit}
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  );
}

export function RegisterForm_container() {
  return (
    <div>
      <Row style={{ marginTop: "5%", marginLeft: "46%" }}>
        <Col offset={2}>
          <h3>注册</h3>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: "2%" }}>
        <Col span={8}>
          <RegisterForm_manage />
        </Col>
      </Row>
    </div>
  );
}

class RegisterForm_manage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isModalVisible: false };

    this.code = React.createRef();

    this.handle_submit = this.handle_submit.bind(this);
    this.handle_ok = this.handle_ok.bind(this);
    this.handle_cancel = this.handle_cancel.bind(this);
  }

  async handle_submit(mail, password, passwordC, phone, address, shopAddress) {
    var input_obj = new Object();
    input_obj.email = mail;
    input_obj.password = password;
    input_obj.phone = phone;
    input_obj.address = address;
    input_obj.shopAddress = shopAddress;

    var result = await api.sendRegister(input_obj);
    if (result.status != "success") {
      err1();
    } else {
      this.setState({ isModalVisible: true });
    }
  }

  handle_ok() {
    console.log(this.code.current.state.value);
    this.setState({ isModalVisible: false });
  }

  handle_cancel() {
    this.setState({ isModalVisible: false });
  }

  render() {
    return (
      <div>
        <RegisterForm
          handle_submit={this.handle_submit}
          onCancel={() => this.setState({ isModalVisible: false })}
        />
        <Modal
          title="输入验证码"
          visible={this.state.isModalVisible}
          onOk={this.handle_ok}
          onCancel={this.handle_cancel}
          okText="确认"
          cancelText="取消"
        >
          <div style={{ width: "20%" }}>
            <Input ref={this.code} />
          </div>
        </Modal>
      </div>
    );
  }
}
