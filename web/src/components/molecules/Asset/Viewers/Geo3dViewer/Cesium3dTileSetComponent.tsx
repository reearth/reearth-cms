import { Cesium3DTileset } from "cesium";
import { ComponentProps, useCallback } from "react";
import { Cesium3DTileset as Resium3DTileset } from "resium";

type Props = ComponentProps<typeof Resium3DTileset> & {
  viewerRef?: any;
};

const Cesium3dTileSetComponent: React.FC<Props> = ({ viewerRef, ...props }) => {
  const handleReady = useCallback(
    async (tileset: Cesium3DTileset) => {
      try {
        // Wait for the next frame to ensure everything is properly initialized
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (tileset.isDestroyed()) return;
        await viewerRef.current?.cesiumElement?.zoomTo(tileset);
        tileset.show = true;
      } catch (err) {
        console.error(err);
      }
    },
    [viewerRef],
  );

  return <Resium3DTileset {...props} onReady={handleReady} />;
};

export default Cesium3dTileSetComponent;
