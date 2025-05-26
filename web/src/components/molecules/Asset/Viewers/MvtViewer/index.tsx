import { Viewer as CesiumViewer } from "cesium";
import { useCallback, useState, RefObject } from "react";
import { CesiumComponentRef } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery, Property } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  viewerRef: RefObject<CesiumComponentRef<CesiumViewer>>;
};

const MvtViewer: React.FC<Props> = ({ viewerRef, isAssetPublic, url, workspaceSettings }) => {
  const [properties, setProperties] = useState<Property>();

  const handleProperties = useCallback((prop: Property) => {
    if (!prop || typeof prop !== "object") {
      setProperties(undefined);
      return;
    }

    try {
      const attributes =
        typeof prop.attributes === "string" ? JSON.parse(prop.attributes) : prop.attributes;
      setProperties({ ...prop, attributes });
    } catch {
      setProperties(prop);
    }
  }, []);

  return (
    <ResiumViewer
      viewerRef={viewerRef}
      properties={properties}
      workspaceSettings={workspaceSettings}>
      <Imagery
        viewerRef={viewerRef}
        isAssetPublic={isAssetPublic}
        url={url}
        handleProperties={handleProperties}
      />
    </ResiumViewer>
  );
};

export default MvtViewer;
