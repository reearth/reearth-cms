import type { Geometry } from "geojson";
import { isEmpty } from "ol/extent";
import type { Extent } from "ol/extent";
import { fromLonLat, transformExtent } from "ol/proj";
import { useEffect } from "react";

import { isJapanese } from "@reearth-cms/i18n";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";

import { FocusKind } from "../core/types";
import type { FocusRequest } from "../core/types";

import type { MapHandles } from "./useOlMap";

const PADDING = [64, 64, 64, 64];

/** Every continent but Antarctica. */
const WORLD_EXTENT: Extent = transformExtent([-180, -60, 180, 75], "EPSG:4326", "EPSG:3857");
/** Yonaguni to eastern Hokkaido; the remote islands would leave the main ones tiny. */
const JAPAN_EXTENT: Extent = transformExtent([122, 24, 146, 46], "EPSG:4326", "EPSG:3857");

/** Where an empty value opens: Japan for Japanese users, the world for everyone else. */
export function defaultExtent(lang: string): Extent {
  return isJapanese(lang) ? JAPAN_EXTENT : WORLD_EXTENT;
}

export function extentOf(geometries: readonly Geometry[]): Extent | null {
  const bbox = GeoUtils.bbox(geometries);
  return bbox ? transformExtent(bbox, "EPSG:4326", "EPSG:3857") : null;
}

export function fitTo(handles: MapHandles, extent: Extent | null, maxZoom = 17, duration = 300) {
  if (!extent || isEmpty(extent)) return;
  handles.map.getView().fit(extent, { padding: PADDING, maxZoom, duration });
}

/** Moves the map when the store asks it to (zoom to shape, search result, new value). */
export function useMapFocus(handles: MapHandles | null, focus: FocusRequest | null) {
  useEffect(() => {
    if (!handles || !focus) return;
    const view = handles.map.getView();

    const target: Extent | null =
      focus.kind === FocusKind.GEOMETRY
        ? extentOf([focus.geometry])
        : focus.kind === FocusKind.EXTENT
          ? transformExtent([...focus.extent], "EPSG:4326", "EPSG:3857")
          : null;

    if (target) {
      fitTo(handles, target);
      return;
    }
    if (focus.kind === FocusKind.POSITION) {
      view.animate({
        center: fromLonLat(focus.position),
        zoom: focus.zoom ?? Math.max(view.getZoom() ?? 0, 16),
        duration: 300,
      });
    }
  }, [handles, focus]);
}
