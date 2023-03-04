import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useCallback, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { getExtension } from "@reearth-cms/utils/file";

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
  const [featureSelected, selectFeature] = useState(false);
  const handleSelect = useCallback((e: string | undefined) => {
    selectFeature(!!e);
  }, []);
  const ext = getExtension(url) ?? assetFileExt;
  const renderAsset = useCallback(() => {
    switch (ext) {
      case "czml":
        return <CzmlComponent data={url} />;
      case "kml":
        return <KmlComponent data={url} />;
      case "geojson":
      default:
        return <GeoJsonComponent data={url} />;
    }
  }, [ext, url]);

  return (
    <ResiumViewer
      showDescription={ext === "czml"}
      {...viewerProps}
      onGetViewer={onGetViewer}
      entitySelected={featureSelected}
      onSelect={handleSelect}>
      {renderAsset()}
    </ResiumViewer>
  );
};

export default GeoViewer;
