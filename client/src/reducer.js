import { orderInfoIni } from "./public_data";

let index = 0;

export const orderInfoReducer = (state = orderInfoIni.orderProduct, action) => {
  switch (action.type) {
    case "ADD_ORDER_PRODUCT":
      var newState = [...state, action.productList];

      return newState;
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
