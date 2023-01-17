import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
};

const Geo3dViewer: React.FC<Props> = ({ viewerProps, url }) => {
  return (
    <ResiumViewer {...viewerProps}>
      <Cesium3dTileSetComponent url={url} />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
