import { Viewer as CesiumViewer } from "cesium";
import { useCallback, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery, Property } from "./Imagery";

type Props = {
  url: string;
  onGetViewer: (viewer?: CesiumViewer) => void;
  workspaceSettings: WorkspaceSettings;
};

const MvtViewer: React.FC<Props> = ({ url, onGetViewer, workspaceSettings }) => {
  const [properties, setProperties] = useState<Property>();
  const handleProperties = useCallback((prop: Property) => {
    if (typeof prop !== "object" || !prop || typeof prop.attributes !== "string") {
      setProperties(prop);
    } else {
      try {
        setProperties({ ...prop, attributes: JSON.parse(prop.attributes) });
      } catch {
        setProperties(prop);
      }
    }
  }, []);

  return (
    <ResiumViewer
      onGetViewer={onGetViewer}
      properties={properties}
      workspaceSettings={workspaceSettings}>
      <Imagery url={url} handleProperties={handleProperties} />
    </ResiumViewer>
  );
};

export default MvtViewer;
