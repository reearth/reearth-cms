import { Viewer as CesiumViewer } from "cesium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  url: string;
  onGetViewer: (viewer?: CesiumViewer) => void;
  workspaceSettings: WorkspaceSettings;
};

const GltfViewer: React.FC<Props> = ({ url, onGetViewer, workspaceSettings }) => {
  return (
    <ResiumViewer onGetViewer={onGetViewer} workspaceSettings={workspaceSettings}>
      <Imagery url={url} />
    </ResiumViewer>
  );
};

export default GltfViewer;
