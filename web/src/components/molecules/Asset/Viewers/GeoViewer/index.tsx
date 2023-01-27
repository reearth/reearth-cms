import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useCallback, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  assetFileExt?: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
};

// TODO: One generic component for these three datatypes should be created instead.
const GeoViewer: React.FC<Props> = ({ viewerProps, url, assetFileExt, onGetViewer }) => {
  const [isViewerLoading, setIsViewerLoading] = useState(true);

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
  }, [assetFileExt, url]);

  return (
    <ResiumViewer {...viewerProps} isViewerLoading={isViewerLoading} onGetViewer={onGetViewer}>
      {renderAsset()}
    </ResiumViewer>
  );
};

export default GeoViewer;
