import React from "react";

import Payment_form from "./components/component_payment";
import { Direct_payform_manage } from "./components/component_directpay";

export function Payment() {
  return <Payment_form />;
}

export function Payment_direct() {
  return <Direct_payform_manage />;
}
