import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useEffect } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { getExtension } from "@reearth-cms/utils/file";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  isViewerLoading: boolean;
  setIsViewerLoading: (loading: boolean) => void;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  setAssetUrl: (url: string) => void;
};

const Geo3dViewer: React.FC<Props> = ({
  viewerProps,
  url,
  setAssetUrl,
  isViewerLoading,
  setIsViewerLoading,
  onGetViewer,
}) => {
  useEffect(() => {
    const assetExtension = getExtension(url);
    if (compressedFileFormats.includes(assetExtension)) {
      const nameRegex = /\.\w+$/;
      const base = url.replace(nameRegex, "");
      setAssetUrl(`${base}/tileset.json`);
    }
  }, [setAssetUrl, url]);

  return (
    <ResiumViewer {...viewerProps} isViewerLoading={isViewerLoading} onGetViewer={onGetViewer}>
      <Cesium3dTileSetComponent url={url} setIsViewerLoading={setIsViewerLoading} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
