import React from "react";

import { Switch, Route, Router } from "react-router-dom";

import history from "./history";

import { Payment_1, Payment_2 } from "./payment";
import { Home } from "./home";
import { Home_productDetail } from "./components/component_home";
import { Login } from "./login";
import { Register } from "./register";
import { ShoppingCart } from "./shoppingcart";
import { OrderList } from "./components/component_orderlist";
import { Reward } from "./components/component_reward";
import { WebSocketControl } from "./components/componet_notify";

//for redux
import { createStore } from "redux";
import { Provider } from "react-redux";
import { combineReducers } from "redux";

import { persistStore, persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/lib/integration/react";

import bg1 from "../images/bg1.jpg";

var sectionStyle = {
  width: "100%",
  height: "100%",
  // makesure here is String确保这里是一个字符串，以下是es6写法
  backgroundImage: `url(${bg1})`,
  backgroundSize: "cover",
};

const storageConfig = {
  key: "root", // 必须有的
  storage: storage, // 缓存机制
  blacklist: [], // reducer 里不持久化的数据,除此外均为持久化数据
};

import {
  orderInfoReducer,
  userInfoReducer,
  productListReducer,
  actionReducer,
  productDetailReducer,
} from "./reducer";

import { orderListReducer } from "./reducer_shop";

const rootReducer = combineReducers({
  orderInfoReducer,
  userInfoReducer,
  productListReducer,
  actionReducer,
  productDetailReducer,
  orderListReducer,
});

/*export const store = createStore(rootReducer);*/

const myPersistReducer = persistReducer(storageConfig, rootReducer);
export const store = createStore(myPersistReducer);
export const persistor = persistStore(store);

function Main() {
  return (
    <Switch>
      <Route path="/payment_1">
        <Payment_1 />
      </Route>
      <Route path="/payment_2">
        <Payment_2 />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route path="/home">
        <Home />
      </Route>
      <Route path="/cart">
        <ShoppingCart />
      </Route>
      <Route path="/productDetail">
        <Home_productDetail />
      </Route>
      <Route path="/orderList">
        <OrderList />
      </Route>
      <Route path="/reward">
        <Reward />
      </Route>
      <Route path="/notify">
        <WebSocketControl />
      </Route>
      <Route path="/">
        <Login />
      </Route>
            
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router history={history}>
          <div style={sectionStyle}>
            <Main />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;
