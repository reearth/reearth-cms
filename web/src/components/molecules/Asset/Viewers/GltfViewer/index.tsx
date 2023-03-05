import { Viewer as CesiumViewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import { Imagery } from "./imagery";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: CesiumViewer | undefined) => void;
};

const GltfViewer: React.FC<Props> = ({ viewerProps, url, onGetViewer }) => {
  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer}>
      <Imagery url={url} />
    </ResiumViewer>
  );
};

export default GltfViewer;
