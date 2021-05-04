function addNewOrderList(state, inputObj) {
  function findOrderNumber(input) {
    return input.orderNumber == this;
  }

  var newArray = state;

  if (inputObj.length > 0) {
    for (var i = 0; i < inputObj.length; i++) {
      var index;
      index = newArray.findIndex(findOrderNumber, inputObj[i].orderNumber);
      if (index == -1) {
        newArray.push(inputObj[i]);
      } else {
        newArray[index] = inputObj[i];
      }
    }
  }

  newArray.sort(function (a, b) {
    return a.paymentTime < b.paymentTime ? 1 : -1;
  });

  /*newArray.sort(function (a, b) {
    return a.orderNumber < b.orderNumber ? 1 : -1;
  });*/

  return newArray.slice(0);
}

function updateOrder(state, orderFun) {
  var newArray = state;

  if (orderFun == "byDate") {
    newArray.sort(function (a, b) {
      return a.paymentTime < b.paymentTime ? 1 : -1;
    });

    return newArray.slice(0);
  } else {
    newArray.sort(function (a, b) {
      return a.orderNumber < b.orderNumber ? 1 : -1;
    });

    return newArray.slice(0);
  }
}

function updateOrderLIst(state, inputObj) {
  const newArray = state.map((item, index) => {
    if (item.orderNumber == inputObj.orderNumber) {
      item.status = inputObj.status;
      item.status1 = inputObj.status1; //pay or no pay
    }
    return item;
  });

  return newArray;
}

export const orderListReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_ORDER_LIST":
      return addNewOrderList(state, action.payload);

    case "UPDATE_ORDER_STATUS":
      return updateOrderLIst(state, action.payload);

    case "UPDATE_ORDER_FUN":
      return updateOrder(state, action.payload);

    case "DEL_ORDER_LIST":
      return [];

    default:
      return state;
  }
};

//level-1:
//lever-2: manage
//lever-3: owner
export const manageReducer = (state = "", action) => {
  switch (action.type) {
    case "UPDATE_MANAGE_STATUS":
      return action.payload;

    case "DELETE_MANAGE_STATUS":
      return [];

    default:
      return state;
  }
};
