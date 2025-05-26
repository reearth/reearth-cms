import { Viewer as CesiumViewer } from "cesium";
import { RefObject } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import GeoJsonComponent from "../GeoViewer/GeoJsonComponent";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  assetFileExt?: string;
  workspaceSettings: WorkspaceSettings;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
};

const GeoJSONViewer: React.FC<Props> = ({ isAssetPublic, url, workspaceSettings, viewerRef }) => {
  return (
    <ResiumViewer viewerRef={viewerRef} workspaceSettings={workspaceSettings}>
      <GeoJsonComponent viewerRef={viewerRef} url={url} isAssetPublic={isAssetPublic} />
    </ResiumViewer>
  );
};

export default GeoJSONViewer;
