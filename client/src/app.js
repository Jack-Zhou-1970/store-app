import React from "react";

import { BrowserRouter } from "react-router-dom";
import { Switch, Route, Router } from "react-router-dom";

import history from "./history";

import { Payment, Payment_direct } from "./payment";
import { Home } from "./home";
import { Login } from "./login";
import { Register } from "./register";

//for redux
import { createStore } from "redux";
import { Provider } from "react-redux";
import { combineReducers } from "redux";

import {
  orderInfoReducer,
  userInfoReducer,
  productListReducer,
  actionReducer,
  productDetailReducer,
} from "./reducer";

const rootReducer = combineReducers({
  orderInfoReducer,
  userInfoReducer,
  productListReducer,
  actionReducer,
  productDetailReducer,
});

export const store = createStore(rootReducer);

function Main() {
  return (
    <Switch>
      <Route path="/normal-pay">
        <Payment />
      </Route>
      <Route path="/payment">
        <Payment_direct />
      </Route>
      <Route path="/register">
        <Register />
      </Route>
      <Route path="/home">
        <Home />
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
      <Router history={history}>
        <Main />
      </Router>
    </Provider>
  );
}

export default App;
