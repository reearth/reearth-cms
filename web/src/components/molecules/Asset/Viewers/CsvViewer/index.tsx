import { Viewer as CesiumViewer } from "cesium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  url: string;
  blob?: Blob;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  workspaceSettings: WorkspaceSettings;
};

const CsvViewer: React.FC<Props> = ({ blob, onGetViewer, workspaceSettings }) => {
  return (
    <ResiumViewer onGetViewer={onGetViewer} workspaceSettings={workspaceSettings}>
      <Imagery blob={blob} />
    </ResiumViewer>
  );
};

export default CsvViewer;
