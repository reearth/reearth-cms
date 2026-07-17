/* eslint-disable @typescript-eslint/no-namespace */
import { matchers as emotionMatchers } from "@emotion/jest";
import type { EmotionMatchers } from "@emotion/jest";
import "@ant-design/v5-patch-for-react-19";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { beforeAll, beforeEach, afterEach, expect } from "vitest";

import Modal from "@reearth-cms/components/atoms/Modal";

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

// jsdom 29 computes CSS (making antd animated elements invisible via opacity:0),
// but doesn't fire animation events. rc-motion for antd Modal has no motionDeadline,
// so it waits forever for animationend/transitionend that never come.
// This observer fires them as soon as rc-motion adds the -active class.
let _animationObserver: MutationObserver;
beforeEach(() => {
  _animationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type !== "attributes" || mutation.attributeName !== "class") continue;
      const el = mutation.target as HTMLElement;
      const cls = el.getAttribute("class") ?? "";
      if (!/-appear-active|-enter-active|-leave-active/.test(cls)) continue;
      setTimeout(() => {
        el.dispatchEvent(new Event("animationend", { bubbles: true }));
        el.dispatchEvent(new Event("transitionend", { bubbles: true }));
      }, 0);
    }
  });
  _animationObserver.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
});

afterEach(() => {
  _animationObserver?.disconnect();
  // Modal.confirm/info/etc. mount a standalone React root outside RTL's render
  // tree, so cleanup() never unmounts it. Force-unmount here (while window/document
  // are still alive) instead of just wiping the DOM out from under a live root,
  // which left pending scheduler work that threw "window is not defined" once the
  // whole suite tore down (https://github.com/reearth/reearth-cms/actions/runs/29556580184).
  Modal.destroyAll();
  cleanup();
  document.body.innerHTML = "";
});
