import { store } from "./app";

export function processDataFromServer(data) {
  switch (data.content) {
    case "orderInfo":
      store.dispatch({
        type: "ADD_ORDER_LIST",
        payload: data.orderInfo,
      });
      break;

    case "captureSuccess":
      data.status = "readyPickup";
      store.dispatch({
        type: "UPDATE_ORDER_STATUS",
        payload: data,
      });
      break;

    case "pickUpSuccess":
      data.status = "complete";
      store.dispatch({
        type: "UPDATE_ORDER_STATUS",
        payload: data,
      });
      break;

    default:
      break;
  }
}

export function howManyStatus(orderInfo, status) {
  var num = 0;

  if (orderInfo.length > 0) {
    for (var i = 0; i < orderInfo.length; i++) {
      if (orderInfo[i].status == status) {
        num++;
      }
    }
  }

  return num;
}
