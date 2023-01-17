import { ComponentProps, useCallback } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  assetFileExt?: string;
};

// TODO: One generic component for these three datatypes should be created instead.
const GeoViewer: React.FC<Props> = ({ viewerProps, url, assetFileExt }) => {
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

  return <ResiumViewer {...viewerProps}>{renderAsset()}</ResiumViewer>;
};

export default GeoViewer;
