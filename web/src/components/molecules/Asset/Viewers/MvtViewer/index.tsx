import { Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer } from "resium";

import { Imagery } from "./Imagery";
import { ImageryProviderOption } from "./imagery.type";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  imageryOption: ImageryProviderOption;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, imageryOption, onGetViewer }) => {
  let viewer: Viewer | undefined;

  return (
    <ResiumViewer
      {...viewerProps}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}>
      <Imagery imageryOption={imageryOption} viewer={viewer} />
    </ResiumViewer>
  );
};

export default MvtViewer;
