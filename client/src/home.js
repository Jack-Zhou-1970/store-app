import React from "react";
import { Switch, Route, Router } from "react-router-dom";

import { history1 } from "./history";

import {
  Home_header,
  Home_ProductList,
  Home_productDetail,
} from "./components/component_home";

function Home_content() {
  return (
    <Switch>
      <Route path="/productDetail">
        <Home_productDetail />
      </Route>
      <Route path="/">
        <Home_ProductList />
      </Route>
            
    </Switch>
  );
}

export function Home() {
  return (
    <Router history={history1}>
      <Home_header />
      <Home_content />
    </Router>
  );
}
