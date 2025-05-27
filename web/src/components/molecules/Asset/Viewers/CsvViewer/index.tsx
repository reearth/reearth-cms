import { Viewer as CesiumViewer } from "cesium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  onGetViewer: (viewer?: CesiumViewer) => void;
};

const CsvViewer: React.FC<Props> = ({ isAssetPublic, url, workspaceSettings, onGetViewer }) => {
  return (
    <ResiumViewer onGetViewer={onGetViewer} workspaceSettings={workspaceSettings}>
      <Imagery isAssetPublic={isAssetPublic} url={url} />
    </ResiumViewer>
  );
};

export default CsvViewer;
