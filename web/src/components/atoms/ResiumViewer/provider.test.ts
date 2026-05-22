import { test, expect, describe } from "vitest";

import { isLabelsOverlayProvider, LABELS_OVERLAY_ALPHA, LABELS_OVERLAY_FLAG } from "./provider";

describe("isLabelsOverlayProvider", () => {
  test("returns true when the flag is set to true", () => {
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: true })).toBe(true);
  });

  test("returns true for any truthy flag value (uses !! coercion)", () => {
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: 1 })).toBe(true);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: "yes" })).toBe(true);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: {} })).toBe(true);
  });

  test("returns false when the flag is missing", () => {
    expect(isLabelsOverlayProvider({})).toBe(false);
    expect(isLabelsOverlayProvider({ someOtherKey: true })).toBe(false);
  });

  test("returns false when the flag is falsy", () => {
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: false })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: 0 })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: "" })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: null })).toBe(false);
    expect(isLabelsOverlayProvider({ [LABELS_OVERLAY_FLAG]: undefined })).toBe(false);
  });

  test("returns false for null and undefined", () => {
    expect(isLabelsOverlayProvider(null)).toBe(false);
    expect(isLabelsOverlayProvider(undefined)).toBe(false);
  });

  test("returns false for primitive inputs", () => {
    expect(isLabelsOverlayProvider("string")).toBe(false);
    expect(isLabelsOverlayProvider(42)).toBe(false);
    expect(isLabelsOverlayProvider(true)).toBe(false);
  });
});

describe("LABELS_OVERLAY_ALPHA", () => {
  test("is 0.5", () => {
    expect(LABELS_OVERLAY_ALPHA).toBe(0.5);
  });
});
