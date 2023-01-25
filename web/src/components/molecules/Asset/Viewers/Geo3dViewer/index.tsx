import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  assetFileExt?: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  setAssetUrl: (url: string) => void;
};

const Geo3dViewer: React.FC<Props> = ({ viewerProps, url, setAssetUrl, onGetViewer }) => {
  const nameRegex = /\.zip|7z$/;
  if (url.match(nameRegex)) {
    const base = url.replace(nameRegex, "");
    setAssetUrl(`${base}/tileset.json`);
  }

  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer}>
      <Cesium3dTileSetComponent url={url} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
