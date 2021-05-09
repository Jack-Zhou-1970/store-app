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
        <Input.Password
          ref={refPassword}
          placeholder="必须包含大小写，数字和特殊字符"
        />
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
        label="昵称"
        name="nickName"
        rules={[{ required: true, message: "请输入昵称" }]}
      >
        <Input style={{ height: "5%", width: "50%" }} ref={refNickName} />
      </Form.Item>

      <Form.Item
        label="自取门店"
        name="shopAddress"
        rules={[{ required: true, message: "选择自取门店!" }]}
      >
        <Select placeholder="选择自取门店" ref={refShopAddress}>
          {allShopAddress}
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

import title from "../../images/title.jpg";
import title1 from "../../images/title1.jpg";

export function RegisterForm_container() {
  return (
    <div>
      <img src={title} style={{ width: "100%" }} />
      <img src={title1} style={{ width: "100%" }} />
      <Row style={{ marginLeft: "46%" }}>
        <Col offset={2}>
          <h3>注册</h3>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: "2%" }}>
        <Col span={8}>
          <RegisterForm_manage />
        </Col>
      </Row>
      <div style={{ height: "50px" }}></div>
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
    return "邮箱格式不对";
  }

  //check password
  regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[^]{6,16}$/;
  result = regexp.test(password);
  if (result != true) {
    return "密码必须包含至少一个大小写字母,数字,特殊字符，且最小为6位，最多16位";
  }

  if (passwordC != password) {
    return "两个密码不相等，请重新输入";
  }

  regexp = /^([0-9]|[-])+$/g;
  result = regexp.test(phone);
  if (result != true) {
    return "电话号码格式不对";
  }

  if (nickName == "" || nickName == undefined) {
    return "必须输入昵称";
  }

  if (shopAddress == "" || shopAddress == undefined) {
    return "选择pickup店地址";
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
          message: "错误！",
          description: "该邮箱已经存在，请换一个邮箱注册！",
          duration: 3,
        });
      } else {
        this.setState({ isModalVisible: true });
      }
    } else {
      notification.open({
        message: "错误！",
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
      err1("校验码错误，您需要重新注册！");
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
          title="输入邮箱收到的验证码"
          visible={this.state.isModalVisible}
          onOk={this.handle_ok}
          onCancel={this.handle_cancel}
          width={300}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
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
