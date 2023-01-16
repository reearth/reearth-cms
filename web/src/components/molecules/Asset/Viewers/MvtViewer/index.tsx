import { Cartesian3, Viewer } from "cesium";
import { ComponentProps } from "react";
import { Entity } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import { Imagery } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer }) => {
  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer}>
      <Entity
        id="default-location"
        name="Tokyo"
        description="This is the default location for cesium's globe"
        position={Cartesian3.fromDegrees(139.767052, 35.681167, 100)}
        point={{ pixelSize: 1 }}
      />
      <Imagery url={url} />
    </ResiumViewer>
  );
};

export default MvtViewer;
