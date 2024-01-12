import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import Settings from "@reearth-cms/components/molecules/Asset/Viewers/Settings";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  workspaceSettings?: WorkspaceSettings;
};

const GltfViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer, workspaceSettings }) => {
  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer}>
      <Imagery url={url} />
      <Settings workspaceSettings={workspaceSettings} />
    </ResiumViewer>
  );
};

export default GltfViewer;
