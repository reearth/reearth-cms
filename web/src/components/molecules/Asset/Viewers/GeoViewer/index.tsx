import { Viewer as CesiumViewer } from "cesium";
import { useMemo } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { getExtension } from "@reearth-cms/utils/file";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  url: string;
  assetFileExt?: string;
  onGetViewer: (viewer?: CesiumViewer) => void;
  workspaceSettings: WorkspaceSettings;
};

const GeoViewer: React.FC<Props> = ({ url, assetFileExt, onGetViewer, workspaceSettings }) => {
  const ext = useMemo(() => getExtension(url) ?? assetFileExt, [url, assetFileExt]);

  const geoComponent = useMemo(() => {
    switch (ext?.toLowerCase()) {
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
      onGetViewer={onGetViewer}
      workspaceSettings={workspaceSettings}>
      {geoComponent}
    </ResiumViewer>
  );
};

export default GeoViewer;
