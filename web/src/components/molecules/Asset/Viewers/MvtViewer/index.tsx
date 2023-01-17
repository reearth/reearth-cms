import { Cartesian3 } from "cesium";
import { ComponentProps, useMemo, useState } from "react";
import { Entity } from "resium";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import { Imagery, Property } from "./Imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
};

const MvtViewer: React.FC<Props> = ({ viewerProps, url }) => {
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
    <ResiumViewer {...viewerProps} properties={attributes} entitySelected={featureSelected}>
      <Entity
        id="default-location"
        name="Tokyo"
        description="This is the default location for cesium's globe"
        position={Cartesian3.fromDegrees(139.767052, 35.681167, 100)}
        point={{ pixelSize: 1 }}
      />
      <Imagery url={url} handleProperties={setProperties} selectFeature={selectFeature} />
    </ResiumViewer>
  );
};

export default MvtViewer;
