import type { FeatureCollection, Position } from "geojson";
import { easeOut } from "ol/easing";
import Point from "ol/geom/Point";
import { unByKey } from "ol/Observable";
import { fromLonLat } from "ol/proj";
import { getVectorContext } from "ol/render";
import type RenderEvent from "ol/render/Event";
import { useEffect } from "react";

import { GeoUtils } from "../core/GeoUtils";
import { GeometryKind } from "../core/types";

import { vertexHandles } from "./handles";
import { rippleStyle } from "./mapStyle";
import type { MapHandles } from "./useOlMap";

const RIPPLE_MS = 1000;

/**
 * Where to ripple for the current selection: a selected Point, or the selected vertex of a
 * line or polygon. Selecting a whole line or polygon has no single position to point at.
 */
export function rippleTarget(
  collection: FeatureCollection,
  selectedId: string | null,
  selectedVertex: number | null,
): Position | null {
  const geometry = GeoUtils.findFeature(collection, selectedId)?.geometry;
  if (!geometry) return null;
  if (geometry.type === GeometryKind.POINT) return geometry.coordinates;
  if (selectedVertex === null) return null;
  return GeoUtils.listVertices(geometry)[selectedVertex]?.position ?? null;
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Plays the ripple once each time a point or vertex becomes selected. The position is read
 * when the selection changes only, so editing the selected vertex doesn't replay it.
 */
export function useRipple(
  handles: MapHandles | null,
  collection: FeatureCollection,
  selectedId: string | null,
  selectedVertex: number | null,
) {
  useEffect(() => {
    if (!handles || prefersReducedMotion()) return;
    const position = rippleTarget(collection, selectedId, selectedVertex);
    if (!position) return;
    const { map, layer, selected } = handles;
    const stored = fromLonLat(position);
    // Follows a vertex being dragged: the map's copy moves before the store's does.
    const livePosition = () => {
      const geometry = selected.item(0)?.getGeometry();
      return (geometry && vertexHandles(geometry)[selectedVertex ?? 0]) ?? stored;
    };
    let start: number | null = null;

    const key = layer.on("postrender", (event: RenderEvent) => {
      const time = event.frameState?.time ?? Date.now();
      start ??= time;
      const elapsed = time - start;
      if (elapsed >= RIPPLE_MS) {
        unByKey(key);
        return;
      }
      const context = getVectorContext(event);
      context.setStyle(rippleStyle(easeOut(elapsed / RIPPLE_MS)));
      context.drawGeometry(new Point(livePosition()));
      // Ask for the next frame until the ripple has played out.
      map.render();
    });
    map.render();

    return () => {
      unByKey(key);
      map.render();
    };
    // Only a new selection starts a ripple; `collection` is read, not watched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handles, selectedId, selectedVertex]);
}
