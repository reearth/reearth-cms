import { Viewer, CzmlDataSource } from "cesium";
import { ComponentProps } from "react";
import { CzmlDataSource as ResiumCzmlDataSource } from "resium";

type Props = {
  viewer?: Viewer | undefined;
} & ComponentProps<typeof ResiumCzmlDataSource>;

const CzmlComponent: React.FC<Props> = ({ viewer }) => {
  const url =
    "https://d2jfi34fqvxlsc.cloudfront.net/usecase/13100_tokyo/daimaruyu/czml/TYO_20200807.czml";

  const onLoad = async (ds: CzmlDataSource) => {
    try {
      await viewer?.dataSources.add(ds);
      await viewer?.zoomTo(ds);
      ds.show = true;
    } catch (error) {
      console.error(error);
    }
  };

  return <ResiumCzmlDataSource data={url} onLoad={onLoad} />;
};

export default CzmlComponent;
