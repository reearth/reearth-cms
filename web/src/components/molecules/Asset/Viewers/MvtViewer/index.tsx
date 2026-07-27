import { useCallback, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import type { CesiumViewerRef } from "@reearth-cms/components/molecules/Asset/types";
import type { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import type { Property } from "./Imagery";
import { Imagery } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  viewerRef: CesiumViewerRef;
  workspaceSettings: WorkspaceSettings;
};

const MvtViewer: React.FC<Props> = ({ isAssetPublic, viewerRef, url, workspaceSettings }) => {
  const [properties, setProperties] = useState<Property>();

  const handleProperties = useCallback((prop: Property) => {
    setProperties(prop && typeof prop === "object" ? prop : undefined);
  }, []);

  return (
    <ResiumViewer
      properties={properties}
      viewerRef={viewerRef}
      workspaceSettings={workspaceSettings}>
      <Imagery isAssetPublic={isAssetPublic} url={url} handleProperties={handleProperties} />
    </ResiumViewer>
  );
};

export default MvtViewer;
