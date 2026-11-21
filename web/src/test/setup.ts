/* eslint-disable @typescript-eslint/no-namespace */
import { matchers as emotionMatchers } from "@emotion/jest";
import type { EmotionMatchers } from "@emotion/jest";
import "@ant-design/v5-patch-for-react-19";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { act, cleanup } from "@testing-library/react";
// Must be the lib (CJS) build: vitest externalizes antd, so components load
// antd/lib and antd/es/modal/destroyFns would be a separate, always-empty array.
import destroyFns from "antd/lib/modal/destroyFns";
import { unstable_IdlePriority, unstable_scheduleCallback } from "scheduler";
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

afterEach(async () => {
  // Modal.confirm/info/etc. mount a standalone React root outside RTL's render
  // tree, so cleanup() never unmounts it. destroyAll() only *schedules* an async
  // close (rc-motion waits for animationend/transitionend, synthesized by the
  // observer above). Outside act(), React 19 runs that unmount and its passive
  // effect flush (react-dom-client:17920, which reads window.event) on the
  // Scheduler via setImmediate; on a loaded CI runner that task can be sliced
  // past this file's jsdom teardown and throw "window is not defined"
  // (https://github.com/reearth/reearth-cms/actions/runs/29556580184,
  // https://github.com/reearth/reearth-cms/actions/runs/30790140377,
  // https://github.com/reearth/reearth-cms/actions/runs/43369604972,
  // https://github.com/reearth/reearth-cms/actions/runs/44465889497,
  // https://github.com/reearth/reearth-cms/actions/runs/44471694971,
  // https://github.com/reearth/reearth-cms/actions/runs/44479462260).
  // Inside act(), React queues that work on the act queue instead and flushes it
  // synchronously before act() resolves. Each step gets its own act() because
  // queued commits only apply on exit, and back-to-back awaits leave no macrotask
  // gap for timers to fire outside act.
  // Gated on destroyFns (antd's own pending-instance list, popped synchronously
  // by destroyAll()) so declarative `<Modal open>` usages elsewhere - which never
  // populate destroyFns and stay mounted until cleanup() - aren't blocked on.
  const hadOpenConfirmModal = destroyFns.length > 0;
  await act(async () => {
    Modal.destroyAll();
  });
  if (hadOpenConfirmModal) {
    for (let i = 0; document.querySelector(".ant-modal-root"); i++) {
      if (i >= 100) throw new Error("modal still mounted");
      await act(() => new Promise<void>(resolve => setTimeout(resolve, 10)));
    }
  }
  _animationObserver?.disconnect();
  cleanup();
  document.body.innerHTML = "";
  // act() only captures work scheduled while it is open. Commits fired from
  // timers during the test body (the observer above, rc-motion's raf steps)
  // already sit on the real Scheduler, so wait for its queue to empty before
  // jsdom teardown. Idle tasks never expire, so this sentinel runs only after
  // every higher-priority task, including yielded continuations. Requires the
  // pinned `scheduler` devDependency to be the same copy react-dom loads.
  await new Promise<void>(resolve => {
    unstable_scheduleCallback(unstable_IdlePriority, () => resolve());
  });
});
