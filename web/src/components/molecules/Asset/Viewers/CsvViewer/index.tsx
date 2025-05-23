import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  viewerRef: any;
};

const CsvViewer: React.FC<Props> = ({ isAssetPublic, url, workspaceSettings, viewerRef }) => {
  return (
    <ResiumViewer viewerRef={viewerRef} workspaceSettings={workspaceSettings}>
      <Imagery viewerRef={viewerRef} isAssetPublic={isAssetPublic} url={url} />
    </ResiumViewer>
  );
};

export default CsvViewer;
