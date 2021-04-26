function addNewOrderList(state, inputObj) {
  function findOrderNumber(input) {
    return input.orderNumber == this;
  }

  var newArray = state;

  if (inputObj.length > 0) {
    for (var i = 0; i < inputObj.length; i++) {
      if (inputObj[i].status == "success") {
        inputObj[i].status = "requireCapture";
      }
      if (
        newArray.find(findOrderNumber, inputObj[i].orderNumber) == undefined
      ) {
        newArray.push(inputObj[i]);
      }
    }
  }

  newArray.sort(function (a, b) {
    return a.paymentTime < b.paymentTime ? 1 : -1;
  });

  return newArray.slice(0);
}

function updateOrderLIst(state, inputObj) {
  const newArray = state.map((item, index) => {
    if (item.orderNumber == inputObj.orderNumber) {
      item.status = inputObj.status;
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
