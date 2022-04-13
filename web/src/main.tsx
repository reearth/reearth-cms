import React from "react";
import * as ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import loadConfig from "./config";

loadConfig().finally(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
