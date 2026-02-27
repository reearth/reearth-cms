import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";

import ResponsiveHeight from "./ResponsiveHeight";

let mockObserve: ReturnType<typeof vi.fn>;
let mockUnobserve: ReturnType<typeof vi.fn>;
let constructorCallCount: number;

beforeEach(() => {
  mockObserve = vi.fn();
  mockUnobserve = vi.fn();
  constructorCallCount = 0;
  global.ResizeObserver = class {
    observe = mockObserve;
    unobserve = mockUnobserve;
    disconnect = vi.fn();
    constructor() {
      constructorCallCount++;
    }
  } as unknown as typeof ResizeObserver;
});

describe("ResponsiveHeight", () => {
  test("renders children", () => {
    render(
      <ResponsiveHeight>
        <div>child content</div>
      </ResponsiveHeight>,
    );
    expect(screen.getByText("child content")).toBeVisible();
  });

  test("creates ResizeObserver when id and onItemHeightChange are provided", () => {
    const onChange = vi.fn();
    render(
      <ResponsiveHeight id="field-1" onItemHeightChange={onChange}>
        <div>child</div>
      </ResponsiveHeight>,
    );
    expect(constructorCallCount).toBe(1);
    expect(mockObserve).toHaveBeenCalledTimes(1);
  });

  test("skips ResizeObserver when id is missing", () => {
    const onChange = vi.fn();
    render(
      <ResponsiveHeight onItemHeightChange={onChange}>
        <div>child</div>
      </ResponsiveHeight>,
    );
    expect(constructorCallCount).toBe(0);
  });

  test("skips ResizeObserver when onItemHeightChange is missing", () => {
    render(
      <ResponsiveHeight id="field-1">
        <div>child</div>
      </ResponsiveHeight>,
    );
    expect(constructorCallCount).toBe(0);
  });

  test("applies height from itemHeights using id", () => {
    const { container } = render(
      <ResponsiveHeight id="field-1" itemHeights={{ "field-1": 120 }}>
        <div>child</div>
      </ResponsiveHeight>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ height: "120px" });
  });

  test("strips version_ prefix from id for height lookup", () => {
    const { container } = render(
      <ResponsiveHeight id="version_field-1" itemHeights={{ "field-1": 80 }}>
        <div>child</div>
      </ResponsiveHeight>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ height: "80px" });
  });

  test("cleans up observer on unmount", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <ResponsiveHeight id="field-1" onItemHeightChange={onChange}>
        <div>child</div>
      </ResponsiveHeight>,
    );
    unmount();
    expect(mockUnobserve).toHaveBeenCalledTimes(1);
  });
});
