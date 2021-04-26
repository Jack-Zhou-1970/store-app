import { store } from "./app";

var audio = new Audio("alert.mp3");

export function processDataFromServer(data, setPlaying) {
  switch (data.content) {
    case "orderInfo":
      store.dispatch({
        type: "ADD_ORDER_LIST",
        payload: data.orderInfo,
      });

      setPlaying(true);

      var timer = setTimeout(function () {
        setPlaying(false);
        clearTimeout(timer);
      }, 1500);

      break;

    case "addInfo":
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
