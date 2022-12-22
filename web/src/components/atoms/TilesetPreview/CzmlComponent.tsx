import { Viewer, CzmlDataSource } from "cesium";
import { ComponentProps } from "react";
import { CzmlDataSource as ResiumCzmlDataSource } from "resium";

type Props = {
  viewer?: Viewer | undefined;
} & ComponentProps<typeof ResiumCzmlDataSource>;

const CzmlComponent: React.FC<Props> = ({ viewer, data }) => {
  const onLoad = async (ds: CzmlDataSource) => {
    try {
      await viewer?.zoomTo(ds);
      ds.show = true;
    } catch (error) {
      console.error(error);
    }
  };

  return <ResiumCzmlDataSource data={data} onLoad={onLoad} />;
};

export default CzmlComponent;
