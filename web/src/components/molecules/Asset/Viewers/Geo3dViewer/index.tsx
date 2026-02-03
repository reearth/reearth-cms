import { Resource, Viewer as CesiumViewer } from "cesium";
import { useEffect, useMemo, RefObject } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { compressedFileFormats } from "@reearth-cms/components/molecules/Common/Asset";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useAuthHeader } from "@reearth-cms/gql";
import { FileUtils } from "@reearth-cms/utils/file";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  setAssetUrl: (url: string) => void;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
};

const Geo3dViewer: React.FC<Props> = ({
  isAssetPublic,
  url,
  workspaceSettings,
  setAssetUrl,
  viewerRef,
}) => {
  const { getHeader } = useAuthHeader();

  useEffect(() => {
    const assetExtension = FileUtils.getExtension(url);
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
    <ResiumViewer viewerRef={viewerRef} workspaceSettings={workspaceSettings}>
      <Cesium3dTileSetComponent url={resource} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
