import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";

import App from "./App";
import loadConfig from "./config";

import "antd/dist/reset.css";
import "./index.css";

loader.config({ monaco });
self.MonacoEnvironment = {
  ...self.MonacoEnvironment,
  getWorker(_moduleId: string, label: string) {
    if (label === "json") return new JsonWorker();
    return new EditorWorker();
  },
};

(async function () {
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
})();
