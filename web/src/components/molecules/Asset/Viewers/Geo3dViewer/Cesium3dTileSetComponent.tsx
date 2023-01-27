import { Cesium3DTileset } from "cesium";
import { ComponentProps, useCallback } from "react";
import { Cesium3DTileset as Resium3DTileset, useCesium } from "resium";

type Props = { setIsViewerLoading: (loading: boolean) => void } & ComponentProps<
  typeof Resium3DTileset
>;

const Cesium3dTileSetComponent: React.FC<Props> = ({ setIsViewerLoading, ...props }) => {
  const { viewer } = useCesium();

  const handleReady = useCallback(
    async (tileset: Cesium3DTileset) => {
      setIsViewerLoading(true);
      try {
        await viewer?.zoomTo(tileset.root.tileset);
        tileset.show = true;
      } catch (error) {
        console.error(error);
      } finally {
        setIsViewerLoading(false);
      }
    },
    [setIsViewerLoading, viewer],
  );

  return <Resium3DTileset {...props} onReady={handleReady} />;
};

export default Cesium3dTileSetComponent;
