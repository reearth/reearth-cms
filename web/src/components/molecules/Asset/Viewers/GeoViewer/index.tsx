import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useCallback } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  assetFileExt?: string;
  isViewerLoading: boolean;
  setIsViewerLoading: (loading: boolean) => void;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
};

// TODO: One generic component for these three datatypes should be created instead.
const GeoViewer: React.FC<Props> = ({
  viewerProps,
  url,
  assetFileExt,
  isViewerLoading,
  setIsViewerLoading,
  onGetViewer,
}) => {
  const renderAsset = useCallback(() => {
    switch (assetFileExt) {
      case "czml":
        return <CzmlComponent data={url} setIsViewerLoading={setIsViewerLoading} />;
      case "kml":
        return <KmlComponent data={url} setIsViewerLoading={setIsViewerLoading} />;
      case "geojson":
      default:
        return <GeoJsonComponent data={url} setIsViewerLoading={setIsViewerLoading} />;
    }
  }, [assetFileExt, setIsViewerLoading, url]);

  return (
    <ResiumViewer {...viewerProps} isViewerLoading={isViewerLoading} onGetViewer={onGetViewer}>
      {renderAsset()}
    </ResiumViewer>
  );
};

export default GeoViewer;
