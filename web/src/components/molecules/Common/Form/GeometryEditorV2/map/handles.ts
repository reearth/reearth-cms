import type { Coordinate } from "ol/coordinate";
import type Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import type OlMap from "ol/Map";
import type { Pixel } from "ol/pixel";

/**
 * Editing handles on the selected shape. White dots are vertices (drag to move one);
 * small dots sit halfway along each edge (drag to add a vertex there). Anywhere else on
 * the shape drags the whole shape — which is what makes a line movable at all, since a
 * line is nothing but edges.
 */

export const HANDLE_TOLERANCE_PX = 10;

export enum HandleKind {
  VERTEX = "vertex",
  MIDPOINT = "midpoint",
}

const midpoints = (coordinates: Coordinate[]): Coordinate[] =>
  coordinates
    .slice(1)
    .map((next, i) => [(coordinates[i][0] + next[0]) / 2, (coordinates[i][1] + next[1]) / 2]);

export function vertexHandles(geometry: Geometry): Coordinate[] {
  if (geometry instanceof Point) return [geometry.getCoordinates()];
  if (geometry instanceof LineString) return geometry.getCoordinates();
  if (geometry instanceof Polygon) {
    // A ring's last position repeats its first.
    return geometry.getCoordinates().flatMap(ring => ring.slice(0, -1));
  }
  return [];
}

export function midpointHandles(geometry: Geometry): Coordinate[] {
  if (geometry instanceof LineString) return midpoints(geometry.getCoordinates());
  if (geometry instanceof Polygon) return geometry.getCoordinates().flatMap(midpoints);
  return [];
}

/**
 * The vertex of `geometry` under `pixel`, as an index into `GeoUtils.listVertices`: both
 * list a line's positions and a polygon's rings in order, without each ring's closing one.
 */
export function vertexIndexAt(map: OlMap, geometry: Geometry, pixel: Pixel): number | null {
  const index = vertexHandles(geometry).findIndex(coordinate => {
    const at = map.getPixelFromCoordinate(coordinate);
    return !!at && Math.hypot(at[0] - pixel[0], at[1] - pixel[1]) <= HANDLE_TOLERANCE_PX;
  });
  return index === -1 ? null : index;
}

/** Which handle of `geometry`, if any, is under `pixel`. */
export function handleAt(map: OlMap, geometry: Geometry, pixel: Pixel): HandleKind | null {
  const near = (coordinate: Coordinate) => {
    const at = map.getPixelFromCoordinate(coordinate);
    return !!at && Math.hypot(at[0] - pixel[0], at[1] - pixel[1]) <= HANDLE_TOLERANCE_PX;
  };
  if (vertexHandles(geometry).some(near)) return HandleKind.VERTEX;
  if (midpointHandles(geometry).some(near)) return HandleKind.MIDPOINT;
  return null;
}

/** Same test in map units, for style functions that only know the resolution. */
export function isNearHandle(geometry: Geometry, coordinate: Coordinate, resolution: number) {
  const tolerance = HANDLE_TOLERANCE_PX * resolution;
  return [...vertexHandles(geometry), ...midpointHandles(geometry)].some(
    handle => Math.hypot(handle[0] - coordinate[0], handle[1] - coordinate[1]) <= tolerance,
  );
}
