import { Viewer as CesiumViewer } from "cesium";
import { useCallback, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery, Property } from "./Imagery";

type Props = {
  isAssetPublic?: boolean;
  url: string;
  workspaceSettings: WorkspaceSettings;
  onGetViewer: (viewer?: CesiumViewer) => void;
};

const MvtViewer: React.FC<Props> = ({ isAssetPublic, url, workspaceSettings, onGetViewer }) => {
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
      onGetViewer={onGetViewer}
      properties={properties}
      workspaceSettings={workspaceSettings}>
      <Imagery isAssetPublic={isAssetPublic} url={url} handleProperties={handleProperties} />
    </ResiumViewer>
  );
};

export default MvtViewer;
