/* eslint-disable @typescript-eslint/no-namespace */
import { matchers as emotionMatchers } from "@emotion/jest";
import type { EmotionMatchers } from "@emotion/jest";
import "@ant-design/v5-patch-for-react-19";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import destroyFns from "antd/es/modal/destroyFns";
import { beforeAll, beforeEach, afterEach, expect, vi } from "vitest";

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

afterEach(async () => {
  // Modal.confirm/info/etc. mount a standalone React root outside RTL's render
  // tree, so cleanup() never unmounts it. destroyAll() only *schedules* an async
  // close (rc-motion waits for a real animationend/transitionend, synthesized by
  // the observer above) - if one was still open, wait for the resulting unmount
  // to actually finish before disconnecting the observer or wiping the DOM, or
  // the pending scheduler work throws "window is not defined" once this test
  // file's jsdom env tears down
  // (https://github.com/reearth/reearth-cms/actions/runs/29556580184,
  // https://github.com/reearth/reearth-cms/actions/runs/29558591266).
  // Gated on destroyFns (antd's own pending-instance list, popped synchronously
  // by destroyAll()) so declarative `<Modal open>` usages elsewhere - which never
  // populate destroyFns and stay mounted until cleanup() - aren't blocked on.
  const hadOpenConfirmModal = destroyFns.length > 0;
  Modal.destroyAll();
  if (hadOpenConfirmModal) {
    await vi.waitFor(() => {
      if (document.querySelector(".ant-modal-root")) throw new Error("modal still mounted");
    });
  }
  // React's Node/jsdom scheduler shim defers commits via setImmediate (see the
  // "Immediate.performWorkUntilDeadline"/"processImmediate" frames in the errors
  // linked above) - flush one tick so any commit still queued from this test's
  // interactions runs now, not after this file's window/document are gone.
  await new Promise(resolve => setImmediate(resolve));
  _animationObserver?.disconnect();
  cleanup();
  document.body.innerHTML = "";
});
