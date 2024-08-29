import { Viewer as CesiumViewer } from "cesium";
import { useEffect } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { getExtension } from "@reearth-cms/utils/file";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  url: string;
  onGetViewer: (viewer?: CesiumViewer) => void;
  setAssetUrl: (url: string) => void;
  workspaceSettings: WorkspaceSettings;
};

const Geo3dViewer: React.FC<Props> = ({ url, setAssetUrl, onGetViewer, workspaceSettings }) => {
  useEffect(() => {
    const assetExtension = getExtension(url);
    if (compressedFileFormats.includes(assetExtension)) {
      const nameRegex = /\.\w+$/;
      const base = url.replace(nameRegex, "");
      setAssetUrl(`${base}/tileset.json`);
    }
  }, [setAssetUrl, url]);

  return (
    <ResiumViewer onGetViewer={onGetViewer} workspaceSettings={workspaceSettings}>
      <Cesium3dTileSetComponent url={url} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
