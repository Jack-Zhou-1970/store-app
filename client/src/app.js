import React from "react";

import { BrowserRouter } from "react-router-dom";
import { Switch, Route, Router } from "react-router-dom";

import history from "./history";

import { Payment, Payment_direct } from "./payment";

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
    <Router history={history}>
      <Main />
    </Router>
  );
}

export default App;
