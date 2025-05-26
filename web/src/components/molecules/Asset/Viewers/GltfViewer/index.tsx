import { Viewer as CesiumViewer } from "cesium";
import { RefObject } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
};

const GltfViewer: React.FC<Props> = ({ isAssetPublic, url, workspaceSettings, viewerRef }) => {
  return (
    <ResiumViewer viewerRef={viewerRef} workspaceSettings={workspaceSettings}>
      <Imagery viewerRef={viewerRef} isAssetPublic={isAssetPublic} url={url} />
    </ResiumViewer>
  );
};

export default GltfViewer;
