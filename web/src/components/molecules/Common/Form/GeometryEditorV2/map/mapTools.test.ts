import Feature from "ol/Feature";
import Draw from "ol/interaction/Draw";
import { describe, expect, test } from "vitest";

import { abortSketch } from "./mapTools";

describe("abortSketch", () => {
  test("drops an unfinished shape and reports it", () => {
    const draw = new Draw({ type: "LineString" });
    // Stand-in for a sketch started by clicking the map.
    (draw as unknown as { sketchFeature_: Feature }).sketchFeature_ = new Feature();
    expect(abortSketch(draw)).toBe(true);
    // Nothing is left to drop, so a second Esc leaves the tool.
    expect(abortSketch(draw)).toBe(false);
  });

  test("reports nothing when no shape is being drawn", () => {
    expect(abortSketch(new Draw({ type: "Point" }))).toBe(false);
    expect(abortSketch(null)).toBe(false);
  });
});
