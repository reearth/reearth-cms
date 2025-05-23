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
  workspaceSettings: WorkspaceSettings;
  viewerRef: any;
};

const GeoViewer: React.FC<Props> = ({
  isAssetPublic,
  url,
  assetFileExt,
  workspaceSettings,
  viewerRef,
}) => {
  const ext = useMemo(() => getExtension(url) ?? assetFileExt, [url, assetFileExt]);

  const geoComponent = useMemo(() => {
    switch (ext?.toLowerCase()) {
      case "czml":
        return <CzmlComponent viewerRef={viewerRef} url={url} isAssetPublic={isAssetPublic} />;
      case "kml":
        return <KmlComponent viewerRef={viewerRef} url={url} isAssetPublic={isAssetPublic} />;
      case "geojson":
      default:
        return <GeoJsonComponent viewerRef={viewerRef} url={url} isAssetPublic={isAssetPublic} />;
    }
  }, [ext, viewerRef, url, isAssetPublic]);

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
