import { func } from "prop-types";
import { orderInfoIni, loginInfo, actionIni } from "./public_data";

//these function used to process orderInfo reducer

function SortByName(a, b) {
  var aName = a.productName.toLowerCase();
  var bName = b.productName.toLowerCase();
  return aName < bName ? -1 : aName > bName ? 1 : 0;
}
/////////////
function findProductName(inputProduct) {
  return (
    inputProduct.mainProductName == this.mainProductName &&
    JSON.stringify(inputProduct.smallProduct.sort(SortByName)) ==
      JSON.stringify(this.smallProduct.sort(SortByName))
  );
}
////////////
function addOrderProduct(orderInfo, productList) {
  //if productList is not exist ,then add a new array
  if (orderInfo.orderProduct.find(findProductName, productList) == undefined) {
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
/////////////

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
////////////////////////

function updateOrderProduct(orderInfo, productListS, productListD) {
  //first delete productListS

  var array1 = orderInfo.orderProduct.map((item) => {
    if (
      item.mainProductName == productListS.mainProductName &&
      JSON.stringify(item.smallProduct.sort(SortByName)) ==
        JSON.stringify(productListS.smallProduct.sort(SortByName))
    ) {
      return null;
    } else {
      return item;
    }
  });

  array1 = array1.filter((item) => {
    return item != undefined;
  });

  if (array1.find(findProductName, productListD) == undefined) {
    return [...array1, productListD];
  } else {
    var array2 = array1.map((item) => {
      if (
        item.mainProductName == productListD.mainProductName &&
        JSON.stringify(item.smallProduct.sort(SortByName)) ==
          JSON.stringify(productListD.smallProduct.sort(SortByName))
      ) {
        item.amount = item.amount + productListD.amount;
        return item;
      } else {
        return item;
      }
    });

    return array2;
  }
}
///////////////////
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

    case "UPDATE_ORDER_PRODUCT":
      var newState = {
        ...state,
        orderProduct: updateOrderProduct(
          state,
          action.productListS,
          action.productListD
        ),
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
      return action.payload;

    default:
      return state;
  }
};

export const productListReducer = (state = [], action) => {
  switch (action.type) {
    case "UPDATE_PRODUCT_INFO":
      return action.payload;

    default:
      return state;
  }
};

export const actionReducer = (state = actionIni, action) => {
  switch (action.type) {
    case "UPDATE_CLASS_INFO":
      return {
        ...state,
        className: action.className,
      };

    case "UPDATE_SELECT_INFO":
      return {
        ...state,
        productName: action.productName,
      };

    default:
      return state;
  }
};
