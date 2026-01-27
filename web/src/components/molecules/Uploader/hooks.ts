import { useContext } from "react";

import { UploaderHookState, UploaderHookStateContext } from "./provider";

export default function useUploaderHook(): UploaderHookState {
  const uploaderContext = useContext(UploaderHookStateContext);

  if (!uploaderContext) {
    throw new Error("useUploaderHook must be used within a UploaderProvider");
  }

  return uploaderContext;
}
