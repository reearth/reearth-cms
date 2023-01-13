import { Viewer } from "cesium";
import { ComponentProps, useCallback } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  assetFileExt?: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const GeoViewer: React.FC<Props> = ({ viewerProps, url, assetFileExt, onGetViewer }) => {
  const renderAsset = useCallback(() => {
    switch (assetFileExt) {
      case "czml":
        return <CzmlComponent data={url} />;
      case "kml":
        return <KmlComponent data={url} />;
      case "geojson":
      default:
        return <GeoJsonComponent data={url} />;
    }
  }, [assetFileExt, url]);

  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer}>
      {renderAsset()}
    </ResiumViewer>
  );
};

export default GeoViewer;
