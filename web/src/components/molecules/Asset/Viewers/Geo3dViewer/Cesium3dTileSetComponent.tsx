import { Cesium3DTileset } from "cesium";
import { ComponentProps } from "react";
import { Cesium3DTileset as Resium3DTileset, useCesium } from "resium";

type Props = ComponentProps<typeof Resium3DTileset>;

const Cesium3dTileSetComponent: React.FC<Props> = ({ ...props }) => {
  const { viewer } = useCesium();

  const handleReady = async (tileset: Cesium3DTileset) => {
    try {
      await viewer?.zoomTo(tileset.root.tileset);
      tileset.show = true;
    } catch (error) {
      console.error(error);
    }
  };

  return <Resium3DTileset {...props} onReady={handleReady} />;
};

export default Cesium3dTileSetComponent;
