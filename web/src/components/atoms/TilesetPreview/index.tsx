import { Viewer } from "cesium";
import { ComponentProps } from "react";
import { Viewer as ResiumViewer } from "resium";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";
import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type TilesetPreviewProps = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  extension: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const TilesetPreview: React.FC<TilesetPreviewProps> = ({
  viewerProps,
  url,
  extension,
  onGetViewer,
}) => {
  let viewer: Viewer | undefined;

  const renderAsset = () => {
    switch (extension) {
      case "czml":
        return <CzmlComponent data={url} viewer={viewer} />;
      case "kml":
        return <KmlComponent data={url} viewer={viewer} />;
      case "geojson":
        return <GeoJsonComponent data={url} viewer={viewer} />;
      case "json":
      default:
        return <Cesium3dTileSetComponent url={url} viewer={viewer} />;
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

export default TilesetPreview;
