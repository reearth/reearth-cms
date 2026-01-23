import { useContext } from "react";

import { UploaderHookStateContext } from "./provider";

export default () => {
  const uploaderContext = useContext(UploaderHookStateContext);

  if (!uploaderContext) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return uploaderContext;
};
