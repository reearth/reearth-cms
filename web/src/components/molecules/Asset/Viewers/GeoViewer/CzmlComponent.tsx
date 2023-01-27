import { CzmlDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { CzmlDataSource as ResiumCzmlDataSource, useCesium } from "resium";

type Props = { setIsViewerLoading: (loading: boolean) => void } & ComponentProps<
  typeof ResiumCzmlDataSource
>;

const CzmlComponent: React.FC<Props> = ({ data, setIsViewerLoading }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: CzmlDataSource) => {
      setIsViewerLoading(true);
      try {
        await viewer?.zoomTo(ds);
        ds.show = true;
      } catch (error) {
        console.error(error);
      } finally {
        setIsViewerLoading(false);
      }
    },
    [setIsViewerLoading, viewer],
  );

  return <ResiumCzmlDataSource data={data} onLoad={handleLoad} />;
};

export default CzmlComponent;
