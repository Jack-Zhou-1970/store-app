import React from "react";

import { BrowserRouter } from "react-router-dom";
import { Switch, Route, Router } from "react-router-dom";

import history from "./history";

import { Payment, Payment_direct } from "./payment";
import { Home } from "./home";

//for redux
import { createStore } from "redux";
import { Provider } from "react-redux";

import { orderInfoReducer } from "./reducer";

export const store = createStore(orderInfoReducer);

function Main() {
  return (
    <Switch>
      <Route path="/normal-pay">
        <Payment />
      </Route>
      <Route path="/">
        <Payment_direct />
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
