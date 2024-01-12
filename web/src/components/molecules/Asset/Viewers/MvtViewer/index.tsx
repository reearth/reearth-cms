import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useMemo, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";
import Settings from "@reearth-cms/components/molecules/Asset/Viewers/Settings";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";

import { Imagery, Property } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
  workspaceSettings?: WorkspaceSettings;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer, workspaceSettings }) => {
  const [properties, setProperties] = useState<Property>();
  const properties2 = useMemo(() => {
    if (typeof properties !== "object" || !properties) return properties;
    const attributes = properties.attributes;
    if (typeof attributes !== "string") {
      return properties;
    }
    try {
      return { ...properties, attributes: JSON.parse(attributes) };
    } catch {
      return properties;
    }
  }, [properties]);

  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer} properties={properties2}>
      <Imagery url={url} handleProperties={setProperties} />
      <Settings workspaceSettings={workspaceSettings} />
    </ResiumViewer>
  );
};

export default MvtViewer;
