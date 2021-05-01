import React from "react";

import { BillInfo } from "./components/component_directpay";
import NormalPay_form from "./components/component_payment";
import {
  WeChatPay_manage,
  AliPay_manage,
  AliPayResult_manage,
} from "./components/component_wallet";

export function Payment_1() {
  return <BillInfo />;
}

export function Payment_2() {
  return <NormalPay_form />;
}

export function Payment_3() {
  return <WeChatPay_manage />;
}

export function Payment_4() {
  return <AliPay_manage />;
}

export function Payment_5() {
  return <AliPayResult_manage />;
}
