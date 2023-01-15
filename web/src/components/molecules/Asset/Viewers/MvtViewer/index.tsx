import { Viewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import { Imagery } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer }) => {
  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer} infoBox={true}>
      <Imagery url={url} />
    </ResiumViewer>
  );
};

export default MvtViewer;
