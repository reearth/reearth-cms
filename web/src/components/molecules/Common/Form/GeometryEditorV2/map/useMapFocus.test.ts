import { getWidth } from "ol/extent";
import { toLonLat } from "ol/proj";
import { describe, expect, test } from "vitest";

import { toMapExtent } from "./useMapFocus";

const lngOf = (x: number): number => toLonLat([x, 0])[0];

describe("toMapExtent", () => {
  test("projects an ordinary box as is", () => {
    const [minX, , maxX] = toMapExtent([139, 35, 140, 36]);
    expect(lngOf(minX)).toBeCloseTo(139);
    expect(lngOf(maxX)).toBeCloseTo(140);
  });

  test("a box across the antimeridian runs past 180° instead of around the world", () => {
    const extent = toMapExtent([170, 45, -170, 50]);
    const [minX, , maxX] = extent;
    expect(lngOf(minX)).toBeCloseTo(170);
    // toLonLat wraps back into [-180, 180]; the extent itself ends at 190°.
    expect(lngOf(maxX)).toBeCloseTo(-170);
    expect(maxX).toBeGreaterThan(minX);
    expect(getWidth(extent)).toBeCloseTo(getWidth(toMapExtent([0, 45, 20, 50])));
  });
});
