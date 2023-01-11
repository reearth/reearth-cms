import { CzmlDataSource } from "cesium";
import { ComponentProps } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

type Props = ComponentProps<typeof ResiumCzmlDataSource>;

const CzmlComponent: React.FC<Props> = ({ data }) => {
  const { viewer } = useCesium();

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
