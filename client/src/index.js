import React, { Component } from "react";
import ReactDOM from "react-dom";
import { hydrate, render } from "react-dom";

import App from "./app.js";

// 把 Provider 作为组件树的根节点
/*ReactDOM.render(<App />, document.getElementById("root"));*/

/*ReactDOM.render(
  <App />,

  document.getElementById("root")
);*/

const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  hydrate(<App />, rootElement);
} else {
  render(<App />, rootElement);
}
