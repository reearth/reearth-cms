import { Viewer as CesiumViewer } from "cesium";
import { MutableRefObject } from "react";

export function waitForViewer(
  viewerRef: MutableRefObject<CesiumViewer | undefined>,
  timeout = 10000,
  interval = 100,
): Promise<CesiumViewer> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const check = () => {
      const viewer = viewerRef.current;
      if (viewer) {
        resolve(viewer);
      } else if (Date.now() - start >= timeout) {
        reject(new Error("Timeout: Cesium viewer was not initialized."));
      } else {
        setTimeout(check, interval);
      }
    };

    check();
  });
}
