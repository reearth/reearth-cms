import { useMemo } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { CesiumViewerRef } from "@reearth-cms/components/molecules/Asset/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { FileUtils } from "@reearth-cms/utils/file";

import CzmlComponent from "./CzmlComponent";
import GeoJsonComponent from "./GeoJsonComponent";
import KmlComponent from "./KmlComponent";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  assetFileExt?: string;
  viewerRef: CesiumViewerRef;
  workspaceSettings: WorkspaceSettings;
};

const GeoViewer: React.FC<Props> = ({
  isAssetPublic,
  url,
  assetFileExt,
  viewerRef,
  workspaceSettings,
}) => {
  const ext = useMemo(() => FileUtils.getExtension(url) ?? assetFileExt, [url, assetFileExt]);

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
      viewerRef={viewerRef}
      workspaceSettings={workspaceSettings}>
      {geoComponent}
    </ResiumViewer>
  );
};

export default GeoViewer;
