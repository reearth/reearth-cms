import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useMemo, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import { Imagery, Property } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  isViewerLoading: boolean;
  setIsViewerLoading: (loading: boolean) => void;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
};

const MvtViewer: React.FC<Props> = ({
  viewerProps,
  url,
  isViewerLoading,
  setIsViewerLoading,
  onGetViewer,
}) => {
  //TODO: refactor me
  const [properties, setProperties] = useState<Property>();
  const [featureSelected, selectFeature] = useState(false);

  const attributes = useMemo(() => {
    if (properties && "attributes" in properties) {
      const attributes = JSON.parse(properties["attributes"] as any);
      return attributes;
    }
  }, [properties]);

  return (
    <ResiumViewer
      {...viewerProps}
      onGetViewer={onGetViewer}
      properties={attributes}
      entitySelected={featureSelected}
      isViewerLoading={isViewerLoading}>
      <Imagery
        url={url}
        handleProperties={setProperties}
        selectFeature={selectFeature}
        setIsViewerLoading={setIsViewerLoading}
      />
    </ResiumViewer>
  );
};

export default MvtViewer;
