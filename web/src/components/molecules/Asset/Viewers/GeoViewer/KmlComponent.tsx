import { KmlDataSource, ConstantProperty } from "cesium";
import { ComponentProps, useCallback } from "react";
import { KmlDataSource as ResiumKmlDataSource, useCesium } from "resium";

type Props = ComponentProps<typeof ResiumKmlDataSource>;

const KmlComponent: React.FC<Props> = ({ data }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: KmlDataSource) => {
      for (const entity of ds.entities.values) {
        if (entity.billboard) {
          entity.billboard.disableDepthTestDistance = new ConstantProperty(
            Number.POSITIVE_INFINITY,
          );
        }
        if (entity.label) {
          entity.label.disableDepthTestDistance = new ConstantProperty(Number.POSITIVE_INFINITY);
        }
      }
      try {
        await viewer?.zoomTo(ds);
        ds.show = true;
      } catch (error) {
        console.error(error);
      }
    },
    [viewer],
  );

  return <ResiumKmlDataSource data={data} onLoad={handleLoad} clampToGround />;
};

export default KmlComponent;
