import { Viewer as CesiumViewer } from "cesium";
import { useMemo } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { getExtension } from "@reearth-cms/utils/file";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  assetFileExt?: string;
  onGetViewer: (viewer?: CesiumViewer) => void;
  workspaceSettings: WorkspaceSettings;
};

const GeoViewer: React.FC<Props> = ({
  isAssetPublic,
  url,
  assetFileExt,
  onGetViewer,
  workspaceSettings,
}) => {
  const ext = useMemo(() => getExtension(url) ?? assetFileExt, [url, assetFileExt]);

  const geoComponent = useMemo(() => {
    switch (ext?.toLowerCase()) {
      case "czml":
        return <CzmlComponent url={url} isAssetPublic={isAssetPublic} />;
      case "kml":
        return <KmlComponent url={url} isAssetPublic={isAssetPublic} />;
      case "geojson":
      default:
        return <GeoJsonComponent url={url} isAssetPublic={isAssetPublic} />;
    }
  }, [ext, url, isAssetPublic]);

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
