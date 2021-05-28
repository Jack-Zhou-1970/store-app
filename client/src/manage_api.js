import { store } from "./app";
import { timer2, audio } from "./components/componet_notify";
import { link_count } from "./components/componet_notify";

export function processDataFromServer(data, setPlaying) {
  switch (data.content) {
    case "orderInfo":
      store.dispatch({
        type: "ADD_ORDER_LIST",
        payload: data.orderInfo,
      });

      console.log("receive orderInfo ");

      audio.currentTime = 0;

      break;

    case "addInfo":
      store.dispatch({
        type: "ADD_ORDER_LIST",
        payload: data.orderInfo,
      });

      break;

    case "captureSuccess":
      data.status = "readyPickup";
      data.status1 = "pay";
      store.dispatch({
        type: "UPDATE_ORDER_STATUS",
        payload: data,
      });
      break;

    case "captureSuccess_NP": //no pay "after payment"
      data.status = "readyPickup";
      data.status1 = "nopay";
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

    case "heartBeat":
      link_count = 0;
      clearTimeout(timer2);
      break;

    default:
      break;
  }
}

export function howManyStatus(orderInfo, status) {
  var num = 0;

  if (orderInfo.length > 0) {
    for (var i = 0; i < orderInfo.length; i++) {
      if (status == "requireCapture") {
        if (
          orderInfo[i].status == "requireCapture" ||
          orderInfo[i].status == "success" ||
          orderInfo[i].status == "afterPayment"
        ) {
          num++;
        }
      } else {
        if (orderInfo[i].status == status) {
          num++;
        }
      }
    }
  }

  return num;
}
