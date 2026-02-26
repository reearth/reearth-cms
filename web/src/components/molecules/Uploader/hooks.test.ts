import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test } from "vitest";

import { UploaderHookState, UploaderHookStateContext } from "./provider";

import useUploaderHook from "./hooks";

describe("useUploaderHook", () => {
  test("Throws error when used outside UploaderProvider", () => {
    expect(() => renderHook(() => useUploaderHook())).toThrow(
      "useUploaderHook must be used within a UploaderProvider",
    );
  });

  test("Returns context value when inside provider", () => {
    const mockContext = { uploaderState: { isOpen: false } } as UploaderHookState;

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(UploaderHookStateContext.Provider, { value: mockContext }, children);

    const { result } = renderHook(() => useUploaderHook(), { wrapper });
    expect(result.current).toBe(mockContext);
  });
});
