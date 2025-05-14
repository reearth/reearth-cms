import { Viewer as CesiumViewer } from "cesium";
import { useEffect } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { getExtension } from "@reearth-cms/utils/file";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  url: string;
  setAssetUrl: (url: string) => void;
  workspaceSettings: WorkspaceSettings;
  onGetViewer: (viewer?: CesiumViewer) => void;
};

const Geo3dViewer: React.FC<Props> = ({ url, setAssetUrl, workspaceSettings, onGetViewer }) => {
  useEffect(() => {
    const assetExtension = getExtension(url);
    if (compressedFileFormats.includes(assetExtension)) {
      const baseUrl = url.replace(/\.\w+$/, "");
      setAssetUrl(`${baseUrl}/tileset.json`);
    }
  }, [setAssetUrl, url]);

  return (
    <ResiumViewer onGetViewer={onGetViewer} workspaceSettings={workspaceSettings}>
      <Cesium3dTileSetComponent url={url} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
