import { Viewer } from "cesium";
import { ComponentProps } from "react";

import ResiumViewer from "@reearth-cms/components/atoms/ResiumViewer";

import Cesium3dTileSetComponent from "./Cesium3dTileSetComponent";

type Props = {
  viewerProps?: ComponentProps<typeof ResiumViewer>;
  url: string;
  onGetViewer: (viewer: Viewer | undefined) => void;
};

const Geo3dViewer: React.FC<Props> = ({ viewerProps, onGetViewer }) => {
  return (
    <ResiumViewer {...viewerProps} onGetViewer={onGetViewer}>
      <Cesium3dTileSetComponent url="http://localhost:8080/assets/60/9d5b43-41da-42d3-8541-99d78020e497/19201_kofu-shi_2022_citygml_1_fld_pref_fujigawa_byodokawa_l1/tileset.json" />
    </ResiumViewer>
  );
};

export default Geo3dViewer;
