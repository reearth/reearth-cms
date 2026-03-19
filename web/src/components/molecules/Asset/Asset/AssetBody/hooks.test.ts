import { renderHook, act } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import useAssetBody from "./hooks";

describe("AssetBody hooks", () => {
  test("initializes with svgRender true", () => {
    const { result } = renderHook(() => useAssetBody());
    expect(result.current.svgRender).toBe(true);
  });

  test("handleCodeSourceClick sets svgRender to false", () => {
    const { result } = renderHook(() => useAssetBody());

    act(() => {
      result.current.handleCodeSourceClick();
    });
    expect(result.current.svgRender).toBe(false);
  });

  test("handleRenderClick sets svgRender to true", () => {
    const { result } = renderHook(() => useAssetBody());

    act(() => {
      result.current.handleCodeSourceClick();
    });
    expect(result.current.svgRender).toBe(false);

    act(() => {
      result.current.handleRenderClick();
    });
    expect(result.current.svgRender).toBe(true);
  });
});
