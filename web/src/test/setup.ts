/* eslint-disable @typescript-eslint/no-namespace */
import { type EmotionMatchers, matchers as emotionMatchers } from "@emotion/jest";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { beforeAll, afterEach, expect } from "vitest";

declare global {
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any , @typescript-eslint/consistent-type-definitions
    interface JestAssertion<T = any> extends jest.Matchers<void, T>, EmotionMatchers {
      toHaveStyleRule: EmotionMatchers["toHaveStyleRule"];
    }
  }
}

expect.extend(domMatchers);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expect.extend(emotionMatchers as any);

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

Object.defineProperty(window, "matchMedia", {
  value: () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

if (!("PointerEvent" in window)) {
  class MockPointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
      this.pointerId = props.pointerId ?? 0;
      this.pointerType = props.pointerType ?? "mouse";
      this.isPrimary = props.isPrimary ?? true;
    }
  }

  Object.defineProperty(window, "PointerEvent", { value: MockPointerEvent });
}

beforeAll(() => {
  const { getComputedStyle } = window;
  window.getComputedStyle = elt => getComputedStyle(elt);
});

afterEach(cleanup);
