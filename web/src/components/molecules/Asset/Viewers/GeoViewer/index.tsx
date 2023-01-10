import { Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer } from "resium";

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
  let viewer: Viewer | undefined;

  const renderAsset = () => {
    switch (assetFileExt) {
      case "czml":
        return <CzmlComponent data={url} viewer={viewer} />;
      case "kml":
        return <KmlComponent data={url} viewer={viewer} />;
      case "geojson":
      default:
        return <GeoJsonComponent data={url} viewer={viewer} />;
    }
  };
  return (
    <ResiumViewer
      {...viewerProps}
      ref={e => {
        viewer = e?.cesiumElement;
        onGetViewer(viewer);
      }}>
      {renderAsset()}
    </ResiumViewer>
  );
};

export default GeoViewer;
