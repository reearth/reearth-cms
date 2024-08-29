import { Viewer as CesiumViewer } from "cesium";
import { useCallback } from "react";

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
      onGetViewer={onGetViewer}
      workspaceSettings={workspaceSettings}>
      {renderAsset()}
    </ResiumViewer>
  );
};

export default GeoViewer;
