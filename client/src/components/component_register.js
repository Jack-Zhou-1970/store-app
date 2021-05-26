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
import { Helmet } from "react-helmet";

export function RegisterForm_container() {
  return (
    <div>
      <Helmet>
        <title>Create Account</title>
        <meta name="description" content="world tea create account page" />
      </Helmet>
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
  var back = [];
  //check Email
  var regexp = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var result = regexp.test(mail);
  if (result != true) {
    back.push("邮箱格式不对");
    back.push("Incorrect email format");
    return back;
  }

  if (password == "" || password == null || password == undefined) {
    back.push("密码长度至少6位");
    back.push(" Password length is at least 6 digits");
    return back;
  }

  if (password.length < 6) {
    back.push("密码长度至少6位");
    back.push(" Password length is at least 6 digits");
    return back;
  }

  if (passwordC != password) {
    back.push("两个密码不相等");
    back.push("The two password are not equal");
    return back;
  }

  regexp = /^([0-9]|[-])+$/g;
  result = regexp.test(phone);
  if (result != true) {
    back.push("电话号码格式不对");
    back.push("Phone number format is not correct");
    return back;
  }

  if (nickName == "" || nickName == undefined) {
    back.push("必须输入昵称");
    back.push("Nickname must be entered");
    return back;
  }

  if (shopAddress == "" || shopAddress == undefined) {
    back.push("选择pickup店地址");
    back.push("Choose pickup shop address");
    return back;
  }

  back.push("success");

  return back;
}

class RegisterForm_manage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalVisible: false,
      isVisble: false,
      msg1: "",
      msg2: "",
    };

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
    if (msg[0] == "success") {
      this.input_obj.email = mail;
      this.input_obj.password = api.encrypt(password);
      this.password_NS = password; //important
      this.input_obj.phone = phone;
      this.input_obj.nickName = nickName;
      this.input_obj.shopAddress = shopAddress;

      var result = await api.sendRegister(this.input_obj);
      if (result.status != "success") {
        this.setState({
          msg1: "该邮箱已经存在，请换一个邮箱注册",
          msg2: "The Email already exist,please changed to another Email to register！",
          isVisble: true,
        });
      } else {
        this.setState({ isModalVisible: true });
      }
    } else {
      this.setState({ msg1: msg[0], msg2: msg[1], isVisble: true });
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
    this.setState({ isVisble: false });
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
          title="Message"
          visible={this.state.isModalVisible}
          onOk={this.handle_ok}
          onCancel={this.handle_cancel}
          width={450}
          closable={false}
          centered={true}
          cancelButtonProps={{ disabled: true }}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          <p>请输入邮箱收到的验证码</p>
          <p>您的邮箱预计最长3-4分钟收到验证码</p>
          <p>在收到验证码之前请不要关闭此对话框</p>
          <p>Please enter the verification code received by the email</p>
          <p>You will receive the verification code in up to 3-4 minutes</p>
          <p>
            Please do not close this dialog box until you receive the
            verification code
          </p>

          <div style={{ width: "80%" }}>
            <Input ref={this.code} />
          </div>
        </Modal>
        <Modal
          title="Message"
          visible={this.state.isVisble}
          onOk={this.handle_cancel}
          onCancel={this.handle_cancel}
          width={400}
          closable={false}
          centered={true}
          maskClosable={false}
          okText="OK"
          cancelText="Cancel"
        >
          <p>{this.state.msg1}</p>
          <p>{this.state.msg2}</p>
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
