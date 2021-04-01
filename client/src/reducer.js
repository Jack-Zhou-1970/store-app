import { orderInfoIni, loginInfo } from "./public_data";

//this function used to process orderInfo reducer

function SortByName(a, b) {
  var aName = a.productName.toLowerCase();
  var bName = b.productName.toLowerCase();
  return aName < bName ? -1 : aName > bName ? 1 : 0;
}

function addOrderProduct(orderInfo, productList) {
  function findMainProductName(inputProduct) {
    return (
      inputProduct.mainProductName == productList.mainProductName &&
      JSON.stringify(inputProduct.smallProduct.sort(SortByName)) ==
        JSON.stringify(productList.smallProduct.sort(SortByName))
    );
  }
  //if productList is not exist ,then add a new array
  if (orderInfo.orderProduct.find(findMainProductName) == undefined) {
    //insert

    return [...orderInfo.orderProduct, productList];
  } else {
    //modified amount
    var newOrderProduct = orderInfo.orderProduct.map((item) => {
      if (
        item.mainProductName == productList.mainProductName &&
        JSON.stringify(item.smallProduct.sort(SortByName)) ==
          JSON.stringify(productList.smallProduct.sort(SortByName))
      ) {
        item.amount = item.amount + productList.amount;
      }

      return item;
    });

    return newOrderProduct;
  }
}

function decOrderProduct(orderInfo, productList) {
  var newOrderProduct = orderInfo.orderProduct.map((item) => {
    if (
      item.mainProductName == productList.mainProductName &&
      JSON.stringify(item.smallProduct.sort(SortByName)) ==
        JSON.stringify(productList.smallProduct.sort(SortByName))
    ) {
      item.amount = item.amount - 1;
    }
    if (item.amount > 0) {
      return item;
    }
  });

  return newOrderProduct.filter((item) => {
    return item != undefined;
  });
}

export const orderInfoReducer = (state = orderInfoIni, action) => {
  switch (action.type) {
    case "ADD_ORDER_PRODUCT":
      var newState = {
        ...state,
        orderProduct: addOrderProduct(state, action.productList),
      };

      return newState;

    case "DEC_ORDER_PRODUCT":
      var newState = {
        ...state,
        orderProduct: decOrderProduct(state, action.productList),
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
