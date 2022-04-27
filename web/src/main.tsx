import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import loadConfig from "./config";

loadConfig().finally(() => {
  const element = document.getElementById("root");
  if (!element) throw new Error("root element is not found");
  const root = ReactDOM.createRoot(element);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
