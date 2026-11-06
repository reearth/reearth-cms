import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

import { t } from "@reearth-cms/i18n";

export enum BaseMapId {
  OSM = "OSM",
  GSI_PALE = "GSI_PALE",
}

export const baseMapOptions = () => [
  { value: BaseMapId.OSM, label: t("Standard (OpenStreetMap)") },
  { value: BaseMapId.GSI_PALE, label: t("Pale (GSI Japan)") },
];

export function createBaseLayer(id: BaseMapId): TileLayer {
  if (id === BaseMapId.GSI_PALE) {
    return new TileLayer({
      source: new XYZ({
        url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
        maxZoom: 18,
        attributions:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">地理院タイル</a>',
      }),
    });
  }
  return new TileLayer({ source: new OSM() });
}
