import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { getExtension } from "@reearth-cms/utils/file";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  setAssetUrl: (url: string) => void;
};

const Geo3dViewer: React.FC<Props> = ({ viewerProps, url, setAssetUrl, onGetViewer }) => {
  const assetExtension = getExtension(url);
  if (compressedFileFormats.includes(assetExtension)) {
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
