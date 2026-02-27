import { Viewer as CesiumViewer } from "cesium";
import { RefObject, useCallback, useState } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery, Property } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
  workspaceSettings: WorkspaceSettings;
};

const MvtViewer: React.FC<Props> = ({ isAssetPublic, url, viewerRef, workspaceSettings }) => {
  const [properties, setProperties] = useState<Property>();

  const handleProperties = useCallback((prop: Property) => {
    setProperties(prop && typeof prop === "object" ? prop : undefined);
  }, []);

  return (
    <ResiumViewer
      properties={properties}
      viewerRef={viewerRef}
      workspaceSettings={workspaceSettings}>
      <Imagery handleProperties={handleProperties} isAssetPublic={isAssetPublic} url={url} />
    </ResiumViewer>
  );
};

export default MvtViewer;
