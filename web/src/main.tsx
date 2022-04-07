import React from "react";
import ReactDOM from "react-dom";

import App from "./app";
import loadConfig from "./config";

loadConfig().finally(() => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
