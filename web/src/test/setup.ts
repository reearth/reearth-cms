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

Object.defineProperty(window, "matchMedia", {
  value: () => ({
    addListener: () => {},
    removeListener: () => {},
  }),
});

beforeAll(() => {
  const { getComputedStyle } = window;
  window.getComputedStyle = elt => {
    if (!elt) {
      // Return a proper mock CSSStyleDeclaration when element is null/undefined
      return new Proxy({} as CSSStyleDeclaration, {
        get(_target, prop) {
          if (prop === "getPropertyValue") {
            return () => "";
          }
          return "";
        },
        set() {
          return true;
        },
      });
    }
    try {
      const styles = getComputedStyle(elt);
      // If the original styles are null or undefined, return our proxy instead
      if (!styles) {
        return new Proxy({} as CSSStyleDeclaration, {
          get(_target, prop) {
            if (prop === "getPropertyValue") {
              return () => "";
            }
            return "";
          },
          set() {
            return true;
          },
        });
      }
      return styles;
    } catch (_error) {
      // If there's any error, return our proxy mock
      return new Proxy({} as CSSStyleDeclaration, {
        get(_target, prop) {
          if (prop === "getPropertyValue") {
            return () => "";
          }
          return "";
        },
        set() {
          return true;
        },
      });
    }
  };
});

afterEach(cleanup);
