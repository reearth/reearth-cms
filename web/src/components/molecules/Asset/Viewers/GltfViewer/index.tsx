import { Viewer as CesiumViewer } from "cesium";
import { RefObject } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  workspaceSettings: WorkspaceSettings;
};

const GltfViewer: React.FC<Props> = ({ isAssetPublic, url, viewerRef, workspaceSettings }) => {
  return (
    <ResiumViewer viewerRef={viewerRef} workspaceSettings={workspaceSettings}>
      <Imagery viewerRef={viewerRef} isAssetPublic={isAssetPublic} url={url} />
    </ResiumViewer>
  );
};

export default GltfViewer;
