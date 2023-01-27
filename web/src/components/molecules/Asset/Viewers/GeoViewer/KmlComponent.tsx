import { KmlDataSource } from "cesium";
import { ComponentProps, useCallback } from "react";
import { KmlDataSource as ResiumKmlDataSource, useCesium } from "resium";

type Props = { setIsViewerLoading: (loading: boolean) => void } & ComponentProps<
  typeof ResiumKmlDataSource
>;

const KmlComponent: React.FC<Props> = ({ data, setIsViewerLoading }) => {
  const { viewer } = useCesium();

  const handleLoad = useCallback(
    async (ds: KmlDataSource) => {
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

  return <ResiumKmlDataSource data={data} onLoad={handleLoad} />;
};

export default KmlComponent;
