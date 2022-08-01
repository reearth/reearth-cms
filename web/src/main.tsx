import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import loadConfig from "./config";

try {
  await loadConfig();
} finally {
  const element = document.getElementById("root");
  if (element) {
    const root = ReactDOM.createRoot(element);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}
