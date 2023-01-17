import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps, useMemo, useState } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import { Imagery, Property } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer }) => {
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
      entitySelected={featureSelected}>
      <Imagery
        url="http://localhost:8080/assets/cd/4830d5-6cb2-4d2a-9b82-9f97e21c94ad/19201_kofu-shi_2022_citygml_1_lsld.zip"
        handleProperties={setProperties}
        selectFeature={selectFeature}
      />
    </ResiumViewer>
  );
};

export default MvtViewer;
