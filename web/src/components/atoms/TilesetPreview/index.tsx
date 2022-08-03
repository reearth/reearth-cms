import { Viewer, Cesium3DTileset } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer, Cesium3DTileset as Resium3DTileset } from "resium";

type TilesetPreviewProps = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  tilesetProps: ComponentProps<typeof Resium3DTileset>;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const TilesetPreview: React.FC<TilesetPreviewProps> = ({
  viewerProps,
  tilesetProps,
  onGetViewer,
}) => {
  let viewer: Viewer | undefined;

  const handleReady = async (tileset: Cesium3DTileset) => {
    try {
      await viewer?.zoomTo(tileset.root.tileset);
      tileset.show = true;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ResiumViewer
      {...viewerProps}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}>
      <Resium3DTileset {...tilesetProps} onReady={handleReady} />
    </ResiumViewer>
  );
};

export default TilesetPreview;
