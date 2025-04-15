import { Cesium3DTileset } from "cesium";
import { ComponentProps, useCallback } from "react";
import { Cesium3DTileset as Resium3DTileset, useCesium } from "resium";

type Props = ComponentProps<typeof Resium3DTileset>;

const Cesium3dTileSetComponent: React.FC<Props> = ({ ...props }) => {
  const { viewer } = useCesium();

  const handleReady = useCallback(
    async (tileset: Cesium3DTileset) => {
      // Wait one frame to prevent unexpected error from next frame
      // because of 3D tiles is handled asynchronously.
      requestAnimationFrame(async () => {
        if (tileset.isDestroyed()) return;
        try {
          await viewer?.zoomTo(tileset);
          tileset.show = true;
        } catch (error) {
          console.error(error);
        }
      });
    },
    [viewer],
  );

  return <Resium3DTileset {...props} onReady={handleReady} />;
};

export default Cesium3dTileSetComponent;
