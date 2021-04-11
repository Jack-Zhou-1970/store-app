import React from "react";

import { BrowserRouter } from "react-router-dom";
import { Switch, Route, Router } from "react-router-dom";

import history from "./history";

import { Payment_1, Payment_2 } from "./payment";
import { Home } from "./home";
import { Login } from "./login";
import { Register } from "./register";
import { ShoppingCart } from "./shoppingcart";

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
