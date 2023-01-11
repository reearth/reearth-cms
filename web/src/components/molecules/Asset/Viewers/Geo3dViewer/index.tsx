import { Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer } from "resium";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const Geo3dViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer }) => {
  let viewer: Viewer | undefined;

  return (
    <ResiumViewer
      {...viewerProps}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}>
      <Cesium3dTileSetComponent url={url} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
