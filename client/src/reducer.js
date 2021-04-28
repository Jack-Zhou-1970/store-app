import { useForm } from "antd/lib/form/Form";
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
        orderProduct: addOrderProduct(state, action.productList).slice(0),
      };

      return newState;

    case "DEC_ORDER_PRODUCT":
      var newState = {
        ...state,
        orderProduct: decOrderProduct(state, action.productList).slice(0),
      };

      return newState;

    case "UPDATE_ORDER_PRODUCT":
      var newState = {
        ...state,
        orderProduct: updateOrderProduct(
          state,
          action.productListS,
          action.productListD
        ).slice(0),
      };

      return newState;

    case "DEL_ORDER_PRODUCT":
      return {
        ...state,
        orderProduct: state.orderProduct
          .filter((item) => item.mainProductName !== action.mainProductName)
          .slice(0),
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

    case "MOD_TOTAL_PRICE":
      return {
        ...state,
        totalPrice: action.totalPrice,
      };

    case "MOD_ORDER_NUMBER":
      return {
        ...state,
        orderNumber: action.orderNumber,
      };

    case "MOD_REWARD_OUT":
      return {
        ...state,
        reward_out: action.reward_out,
      };
    default:
      return state;
  }
};
///////////////////////////////////////////////////////////////////
export const userInfoReducer = (state = loginInfo, action) => {
  switch (action.type) {
    case "UPDATE_USER_INFO":
      return action.payload;

    case "UPDATE_LASTNAME":
      return {
        ...state,
        lastName: action.payload,
      };
    case "UPDATE_FIRSTNAME":
      return {
        ...state,
        firstName: action.payload,
      };
    case "UPDATE_ADDRESS":
      return {
        ...state,
        address: action.payload,
      };
    case "UPDATE_CITY":
      return {
        ...state,
        city: action.payload,
      };

    case "UPDATE_PROVINCE":
      return {
        ...state,
        province: action.payload,
      };

    case "UPDATE_POSTALCODE":
      return {
        ...state,
        postalCode: action.payload,
      };

    case "UPDATE_REWARD":
      return {
        ...state,
        reward: action.payload,
      };

    case "DEL_USER_INFO":
      return loginInfo;

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
///////////////////////////////////////////////////////////////////////////
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

/////the function below is used to process product detail
function updateMidSmall(state, input_obj) {
  function findMidName(inputMiddle) {
    return inputMiddle.middleProductName == this;
  }

  function findSmallName(inputSmall) {
    return inputSmall.smallProductName == this;
  }
  var i, j;

  var productMiddle = new Object();
  productMiddle.middleProductName = input_obj.middleProductName;
  productMiddle.productSmall = [];
  var productSmall = new Object();
  productSmall.smallProductName = input_obj.smallProductName;
  productSmall.smallPrice = input_obj.smallPrice;
  productSmall.amount = input_obj.amount;
  productSmall.smallPrice_T = productSmall.smallPrice * productSmall.amount;
  if (productSmall.smallPrice == 0 || productSmall.amount > 0) {
    productMiddle.productSmall.push(productSmall);
  }

  var productMiddleNew = [];
  productMiddleNew.push(productMiddle);

  if (state.productMiddle == undefined) {
    return productMiddleNew;
  }

  if (state.productMiddle.length == 0) {
    return productMiddleNew;
  }

  if (
    state.productMiddle.find(findMidName, input_obj.middleProductName) ==
    undefined
  ) {
    //just insert

    return [...state.productMiddle, productMiddle];
  }

  for (i = 0; i < state.productMiddle.length; i++) {
    if (
      state.productMiddle[i].middleProductName == input_obj.middleProductName
    ) {
      if (
        state.productMiddle[i].productSmall.find(
          findSmallName,
          input_obj.smallProductName
        ) == undefined
      ) {
        if (input_obj.onlyOne == true) {
          state.productMiddle[i].productSmall = [];
        }
        if (productSmall.smallPrice == 0 || productSmall.amount > 0) {
          state.productMiddle[i].productSmall.push(productSmall);
        }
        break;
      } else {
        //find, let update
        for (j = 0; j < state.productMiddle[i].productSmall.length; j++) {
          if (
            state.productMiddle[i].productSmall[j].smallProductName ==
            input_obj.smallProductName
          ) {
            if (input_obj.smallPrice == 0 || input_obj.amount > 0) {
              state.productMiddle[i].productSmall[j].smallPrice =
                input_obj.smallPrice;
              state.productMiddle[i].productSmall[j].amount = input_obj.amount;
              state.productMiddle[i].productSmall[j].smallPrice_T =
                input_obj.smallPrice * input_obj.amount;
            } else {
              state.productMiddle[i].productSmall.splice(j, 1);
            }
            break;
          }
        }
      }
    }
  }

  return state.productMiddle;
}

export const productDetailReducer = (state = [], action) => {
  switch (action.type) {
    case "UPDATE_PRODUCTDETAIL_INFO":
      return {
        ...state,
        productName: action.product.productName,
        price: action.product.price,
        amount: action.product.amount,

        productMiddle: [],
      };

    case "UPDATE_MIDSMALL_INFO":
      return {
        ...state,
        productMiddle: updateMidSmall(state, action.payload).slice(0),
      };

    case "UPDATE_MAINPRODUCT_AMOUNT":
      return {
        ...state,
        amount: action.amount,
        totalPrice: state.price * action.amount,
      };

    case "UPDATE_MAINPRODUCT_STOCK":
      return {
        ...state,
        stock: action.stock,
      };

    default:
      return state;
  }
};
