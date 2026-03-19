import { describe, test, expect, vi, afterEach } from "vitest";

import { Constant } from "./constant";
import { PerformanceTimer } from "./performance";

describe("PerformanceTimer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("elapsed returns positive number after construction", () => {
    const timer = new PerformanceTimer("test");
    expect(timer.elapsed()).toBeGreaterThanOrEqual(0);
  });

  test("reset restarts the timer", async () => {
    const timer = new PerformanceTimer("test");
    await new Promise(resolve => setTimeout(resolve, 10));
    const beforeReset = timer.elapsed();
    timer.reset();
    const afterReset = timer.elapsed();
    expect(afterReset).toBeLessThan(beforeReset);
  });

  test("log calls console.log when IS_DEV is true", () => {
    vi.spyOn(Constant, "IS_DEV", "get").mockReturnValue(true);
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const timer = new PerformanceTimer("myLabel");
    timer.log();
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[Performance] myLabel:"));
  });

  test("log does not call console.log when IS_DEV is false", () => {
    vi.spyOn(Constant, "IS_DEV", "get").mockReturnValue(false);
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const timer = new PerformanceTimer("myLabel");
    timer.log();
    expect(spy).not.toHaveBeenCalled();
  });
});
