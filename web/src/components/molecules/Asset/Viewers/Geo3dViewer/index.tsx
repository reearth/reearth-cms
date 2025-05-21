import { Viewer as CesiumViewer, Resource } from "cesium";
import { useEffect, useMemo } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useAuthHeader } from "@reearth-cms/gql";
import { getExtension } from "@reearth-cms/utils/file";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  setAssetUrl: (url: string) => void;
  onGetViewer: (viewer?: CesiumViewer) => void;
};

const Geo3dViewer: React.FC<Props> = ({
  isAssetPublic,
  url,
  workspaceSettings,
  setAssetUrl,
  onGetViewer,
}) => {
  const { getHeader } = useAuthHeader();

  useEffect(() => {
    const assetExtension = getExtension(url);
    if (compressedFileFormats.includes(assetExtension)) {
      const baseUrl = url.replace(/\.\w+$/, "");
      setAssetUrl(`${baseUrl}/tileset.json`);
    }
  }, [setAssetUrl, url]);

  const resource = useMemo(async () => {
    return new Resource({
      url: url,
      headers: isAssetPublic ? {} : await getHeader(),
    });
  }, [getHeader, isAssetPublic, url]);

  return (
    <ResiumViewer onGetViewer={onGetViewer} workspaceSettings={workspaceSettings}>
      <Cesium3dTileSetComponent url={resource} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
