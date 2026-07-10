import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { CesiumViewerRef } from "@reearth-cms/components/molecules/Asset/types";
import type { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  viewerRef: CesiumViewerRef;
  workspaceSettings: WorkspaceSettings;
};

const GltfViewer: React.FC<Props> = ({ isAssetPublic, url, viewerRef, workspaceSettings }) => {
  return (
    <ResiumViewer viewerRef={viewerRef} workspaceSettings={workspaceSettings}>
      <Imagery isAssetPublic={isAssetPublic} url={url} />
    </ResiumViewer>
  );
};

export default GltfViewer;
