import { Viewer, KmlDataSource } from "cesium";
import { ComponentProps } from "react";
import { KmlDataSource as ResiumKmlDataSource } from "resium";

type Props = {
  viewer?: Viewer | undefined;
} & ComponentProps<typeof ResiumKmlDataSource>;

const KmlComponent: React.FC<Props> = ({ viewer, data }) => {
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
