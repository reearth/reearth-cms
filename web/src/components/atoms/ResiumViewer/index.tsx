import { createWorldTerrain, Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as RViewer } from "resium";

type Props = {
  onGetViewer: (viewer: Viewer | undefined) => void;
  children?: React.ReactNode;
} & ComponentProps<typeof RViewer>;

const ResiumViewer: React.FC<Props> = ({ onGetViewer, children, ...props }) => {
  let viewer: Viewer | undefined;

  return (
    <RViewer
      style={{ position: "relative" }}
      terrainProvider={createWorldTerrain()}
      navigationHelpButton={false}
      homeButton={false}
      projectionPicker={false}
      sceneModePicker={false}
      baseLayerPicker={false}
      fullscreenButton={false}
      vrButton={false}
      selectionIndicator={false}
      timeline={false}
      animation={false}
      geocoder={false}
      shouldAnimate={true}
      infoBox={false}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}
      {...props}>
      {children}
    </RViewer>
  );
};

export default ResiumViewer;
