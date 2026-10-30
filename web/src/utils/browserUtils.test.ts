import { afterEach, describe, expect, test, vi } from "vitest";

import { BrowserUtils } from "./browserUtils";

describe("BrowserUtils", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("MOD_KEY follows IS_MAC", () => {
    expect(BrowserUtils.MOD_KEY).toBe(BrowserUtils.IS_MAC ? "⌘" : "Ctrl");
  });

  test.each([true, false])("prefersReducedMotion reads the media query (%s)", matches => {
    const matchMedia = vi.fn().mockReturnValue({ matches });
    vi.stubGlobal("matchMedia", matchMedia);
    expect(BrowserUtils.prefersReducedMotion()).toBe(matches);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});
