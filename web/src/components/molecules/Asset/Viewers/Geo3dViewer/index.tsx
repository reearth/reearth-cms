import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  assetFileExt?: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  setAssetUrl: (url: string) => void;
};

const Geo3dViewer: React.FC<Props> = ({
  viewerProps,
  url,
  setAssetUrl,
  assetFileExt,
  onGetViewer,
}) => {
  if (assetFileExt && compressedFileFormats.includes(assetFileExt)) {
    const nameRegex = /\.\w+$/;
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
