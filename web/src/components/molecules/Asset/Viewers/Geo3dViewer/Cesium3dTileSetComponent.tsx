import { Cesium3DTileset } from "cesium";
import { ComponentProps, useCallback } from "react";
import { Cesium3DTileset as Resium3DTileset, useCesium } from "resium";

type Props = ComponentProps<typeof Resium3DTileset>;

const Cesium3dTileSetComponent: React.FC<Props> = ({ ...props }) => {
  const { viewer } = useCesium();

  const handleReady = useCallback(
    async (tileset: Cesium3DTileset) => {
      if (!viewer) return;
      try {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (tileset.isDestroyed()) return;
        await viewer.zoomTo(tileset);
        tileset.show = true;
      } catch (err) {
        console.error(err);
      }
    },
    [viewer],
  );

  return <Resium3DTileset {...props} onReady={handleReady} />;
};

export default Cesium3dTileSetComponent;
