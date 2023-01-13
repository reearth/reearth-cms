import { Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer } from "resium";

import { Imagery } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer }) => {
  let viewer: Viewer | undefined;

  return (
    <ResiumViewer
      {...viewerProps}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}>
      <Imagery url={url} />
    </ResiumViewer>
  );
};

export default MvtViewer;
