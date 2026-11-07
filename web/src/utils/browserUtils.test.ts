import { afterEach, describe, expect, test, vi } from "vitest";

import { BrowserUtils } from "./browserUtils";

// IS_MAC and MOD_KEY are read once at import, so each platform needs a fresh module.
const importFor = async (platform: string): Promise<typeof BrowserUtils> => {
  vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);
  vi.resetModules();
  return (await import("./browserUtils")).BrowserUtils;
};

describe("BrowserUtils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test.each([
    ["MacIntel", true, "⌘"],
    ["iPhone", true, "⌘"],
    ["Win32", false, "Ctrl"],
    ["Linux x86_64", false, "Ctrl"],
  ])("on %s, IS_MAC is %s and MOD_KEY is %s", async (platform, isMac, modKey) => {
    const utils = await importFor(platform);
    expect(utils.IS_MAC).toBe(isMac);
    expect(utils.MOD_KEY).toBe(modKey);
  });

  test.each([true, false])("prefersReducedMotion reads the media query (%s)", matches => {
    const matchMedia = vi.fn().mockReturnValue({ matches });
    vi.stubGlobal("matchMedia", matchMedia);
    expect(BrowserUtils.prefersReducedMotion()).toBe(matches);
    expect(matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});
