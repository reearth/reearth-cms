import { Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer, Cesium3DTileset as Resium3DTileset } from "resium";

// import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";
import CzmlComponent from "./CzmlComponent";

type TilesetPreviewProps = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  tilesetProps: ComponentProps<typeof Resium3DTileset>;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const TilesetPreview: React.FC<TilesetPreviewProps> = ({
  // viewerProps,
  // tilesetProps,
  onGetViewer,
}) => {
  let viewer: Viewer | undefined;

  return (
    <ResiumViewer
      // {...viewerProps}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}>
      {/* <Cesium3dTileSetComponent {...tilesetProps} viewer={viewer} /> */}
      <CzmlComponent />
    </ResiumViewer>
  );
};

export default TilesetPreview;
