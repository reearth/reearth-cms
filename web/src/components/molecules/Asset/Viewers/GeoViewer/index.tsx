import { Viewer as CesiumViewer } from "cesium";
import { RefObject, useMemo } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { FileUtils } from "@reearth-cms/utils/file";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  assetFileExt?: string;
  isAssetPublic?: boolean;
  url: string;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  workspaceSettings: WorkspaceSettings;
};

const GeoViewer: React.FC<Props> = ({
  assetFileExt,
  isAssetPublic,
  url,
  viewerRef,
  workspaceSettings,
}) => {
  const ext = useMemo(() => FileUtils.getExtension(url) ?? assetFileExt, [url, assetFileExt]);

  const geoComponent = useMemo(() => {
    switch (ext?.toLowerCase()) {
      case "czml":
        return <CzmlComponent isAssetPublic={isAssetPublic} url={url} />;
      case "kml":
        return <KmlComponent isAssetPublic={isAssetPublic} url={url} />;
      case "geojson":
      default:
        return <GeoJsonComponent isAssetPublic={isAssetPublic} url={url} />;
    }
  }, [ext, url, isAssetPublic]);

  return (
    <ResiumViewer
      showDescription={ext === "czml"}
      viewerRef={viewerRef}
      workspaceSettings={workspaceSettings}>
      {geoComponent}
    </ResiumViewer>
  );
};

export default GeoViewer;
