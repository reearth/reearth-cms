import { KmlDataSource } from "cesium";
import { ComponentProps } from "react";
import { KmlDataSource as ResiumKmlDataSource, useCesium } from "resium";

type Props = ComponentProps<typeof ResiumKmlDataSource>;

const KmlComponent: React.FC<Props> = ({ data }) => {
  const { viewer } = useCesium();

  const onLoad = async (ds: KmlDataSource) => {
    try {
      await viewer?.zoomTo(ds);
      ds.show = true;
    } catch (error) {
      console.error(error);
    }
  };

  return <ResiumKmlDataSource data={data} onLoad={onLoad} />;
};

export default KmlComponent;
