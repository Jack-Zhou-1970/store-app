import { orderInfoIni } from "./public_data";

export const orderInfoReducer = (state, action) => {
  if (!state)
    return {
      orderInfo: orderInfoIni,
    };
  switch (action.type) {
    case "ADD_ORDER_PRODUCT":
      return {
        ...state,
        orderProduct: state.orderProduct.push(action.orderProduct),
      };
    case "DEL_ORDER_PRODUCT":
      return {
        ...state,
        orderProduct: state.orderProduct.filter(
          (item) => item.mainProductName !== action.mainProductName
        ),
      };
    case "DEL_ALL_ORDER_PRODUCT":
      return {
        ...state,
        orderProduct: [],
      };
    case "MOD_OTHER_FEE":
      return {
        ...state,
        otherFee: action.otherFee,
      };
    case "MOD_PICK_INFO":
      return {
        ...state,
        otherFee: action.otherFee,
        shipFun: action.shipFun,
        rdyPickupTime: action.rdyPickupTime,
      };
    default:
      return state;
  }
};
