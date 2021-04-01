import { orderInfoIni, loginInfo } from "./public_data";

function addOrderProduct(orderInfo, productList) {
  function findMainProductName(inputProduct) {
    return inputProduct.mainProductName == productList.mainProductName;
  }

  //if productList is not exist ,then add a new array
  if (orderInfo.orderProduct.find(findMainProductName) == undefined) {
    //insert

    return [...orderInfo.orderProduct, productList];
  } else {
    //modified amount
    var newOrderProduct = orderInfo.orderProduct.map((item) => {
      if (item.mainProductName == productList.mainProductName) {
        item.amount = item.amount + productList.amount;
      }

      return item;
    });

    return newOrderProduct;
  }
}

export const orderInfoReducer = (state = orderInfoIni, action) => {
  switch (action.type) {
    case "ADD_ORDER_PRODUCT":
      var newState = {
        ...state,
        orderProduct: addOrderProduct(state, action.productList),
      };

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

export const userInfoReducer = (state = loginInfo, action) => {
  switch (action.type) {
    case "UPDATE_USER_INFO":
      return { ...state, province: action.payload };

    default:
      return state;
  }
};
