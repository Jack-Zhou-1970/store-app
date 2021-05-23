import React from "react";
import { useRef } from "react";

import { Row, Col } from "antd";
import {
  Form,
  Input,
  Button,
  message,
  Select,
  Modal,
  notification,
} from "antd";

import history from "../history";
import { store } from "../app";
import { connect } from "react-redux";

import api from "../api";
import Item from "antd/lib/list/Item";

import { storageLogin } from "./component_login";

message.config({
  top: 300,
});

const err1 = (msg) => {
  message.error(msg, 2);
};

function RegisterForm(props) {
  const refMail = useRef(null);
  const refPassword = useRef(null);
  const refPasswordC = useRef(null);
  const refPhone = useRef(null);
  const refNickName = useRef(null);
  const refShopAddress = useRef(null);

  function handle_submit() {
    props.handle_submit(
      refMail.current.state.value,
      refPassword.current.state.value,
      refPasswordC.current.state.value,
      refPhone.current.state.value,
      refNickName.current.state.value,
      refShopAddress.current.props.value
    );
  }

  const allShopAddress = props.allShopAddress.map((item, index) => {
    return <Option value={item}>{item}</Option>;
  });

  return (
    <Form name="basic" initialValues={{ remember: false }}>
      <Form.Item
        label="Email"
        name="username"
        rules={[{ required: true, message: "Please input email!" }]}
      >
        <Input
          style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          ref={refMail}
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input password!" }]}
      >
        <Input.Password
          style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          ref={refPassword}
        />
      </Form.Item>
      <Form.Item
        label="Confirm"
        name="passwordC"
        rules={[{ required: true, message: "Please input password again!" }]}
      >
        <Input.Password
          style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          ref={refPasswordC}
        />
      </Form.Item>
      <Form.Item
        label="Phone"
        name="phone"
        rules={[{ required: true, message: "Phone" }]}
      >
        <Input
          style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          ref={refPhone}
        />
      </Form.Item>
      <Form.Item
        label="NickName"
        name="nickName"
        rules={[{ required: true, message: "Please input NickName" }]}
      >
        <Input
          style={{ borderTop: "0px", borderLeft: "0px", borderRight: "0px" }}
          ref={refNickName}
        />
      </Form.Item>

      <Form.Item
        label="Pickup store"
        name="shopAddress"
        rules={[{ required: true, message: "Please select pickup shop!" }]}
      >
        <Select placeholder="select pickup shop" ref={refShopAddress}>
          {allShopAddress}
        </Select>
      </Form.Item>
      <Row justify="center">
        <Col>
          <Form.Item>
            <Button
              type="primary"
              block={true}
              shape="round"
              onClick={handle_submit}
            >
              Create Account
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

import title from "../../images/title.jpg";
import title1 from "../../images/title1.jpg";

export function RegisterForm_container() {
  return (
    <div>
      <img src={title} style={{ width: "100%" }} />
      <img src={title1} style={{ width: "100%" }} />
      <Row justify="center">
        <Col>
          <h3>Create Account</h3>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: "2%" }}>
        <Col span={10}>
          <RegisterForm_manage />
        </Col>
      </Row>
    </div>
  );
}

function register_check(
  mail,
  password,
  passwordC,
  phone,
  nickName,
  shopAddress
) {
  //check Email
  var regexp = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var result = regexp.test(mail);
  if (result != true) {
    return "邮箱格式不对 Incorrect email format";
  }

  if (password.length < 6) {
    return "密码长度至少6位 Password length is at least 6 digits ";
  }

  if (passwordC != password) {
    return "两个密码不相等 the two password are not equal";
  }

  regexp = /^([0-9]|[-])+$/g;
  result = regexp.test(phone);
  if (result != true) {
    return "电话号码格式不对 phone number format is not correct";
  }

  if (nickName == "" || nickName == undefined) {
    return "必须输入昵称 nickname must be entered";
  }

  if (shopAddress == "" || shopAddress == undefined) {
    return "选择pickup店地址 choose pickup shop address";
  }

  return "success";
}

class RegisterForm_manage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isModalVisible: false };

    this.code = React.createRef();

    this.input_obj = new Object();
    this.password_NS = "";

    this.handle_submit = this.handle_submit.bind(this);
    this.handle_ok = this.handle_ok.bind(this);
    this.handle_cancel = this.handle_cancel.bind(this);
  }

  async handle_submit(mail, password, passwordC, phone, nickName, shopAddress) {
    var msg = register_check(
      mail,
      password,
      passwordC,
      phone,
      nickName,
      shopAddress
    );
    if (msg == "success") {
      this.input_obj.email = mail;
      this.input_obj.password = api.encrypt(password);
      this.password_NS = password; //important
      this.input_obj.phone = phone;
      this.input_obj.nickName = nickName;
      this.input_obj.shopAddress = shopAddress;

      var result = await api.sendRegister(this.input_obj);
      if (result.status != "success") {
        notification.open({
          message: "error！",
          description:
            "该邮箱已经存在，请换一个邮箱注册 The Email already exist,please changed to another Email to register！",
          duration: 3,
        });
      } else {
        this.setState({ isModalVisible: true });
      }
    } else {
      notification.open({
        message: "error！",
        description: msg,
        duration: 2,
      });
    }
  }

  async handle_ok() {
    this.input_obj.password = api.encrypt(this.password_NS);
    this.input_obj.verifyCode = this.code.current.state.value;
    var result = await api.sendVerifyCode(this.input_obj);

    if (result.status == "success") {
      store.dispatch({
        type: "UPDATE_USER_INFO",
        payload: result,
      });

      this.input_obj.password = this.password_NS;
      storageLogin(this.input_obj);
      history.push("/home");
      this.setState({ isModalVisible: false });
    } else {
      err1("校验码错误  the verification code is wrong！");
      this.setState({ isModalVisible: false });
    }
  }

  handle_cancel() {
    this.setState({ isModalVisible: false });
  }

  render() {
    return (
      <div>
        <RegisterForm
          allShopAddress={this.props.allShopAddress}
          handle_submit={this.handle_submit}
          onCancel={() => this.setState({ isModalVisible: false })}
        />
        <Modal
          title="请输入邮箱收到的验证码 Please input the verification code(sent to your email)！"
          visible={this.state.isModalVisible}
          onOk={this.handle_ok}
          onCancel={this.handle_cancel}
          width={400}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          <div style={{ width: "80%" }}>
            <Input ref={this.code} />
          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    allShopAddress: state.userInfoReducer.allShopAddress,
  };
};

RegisterForm_manage = connect(mapStateToProps)(RegisterForm_manage);
