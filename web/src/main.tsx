import React from "react";
import * as ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import "./index.css";
import App from "./App";
import loadConfig from "./config";
import i18n from "./i18n";

loadConfig().finally(() => {
  const element = document.getElementById("root");
  if (!element) throw new Error("root element is not found");
  const root = ReactDOM.createRoot(element);
  root.render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </React.StrictMode>
  );
});
