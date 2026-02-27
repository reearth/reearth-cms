import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import ModelListBody from "./ModelListBody";

describe("ModelListBody", () => {
  test("renders children", () => {
    render(
      <ModelListBody collapsed={false}>
        <span>Child content</span>
      </ModelListBody>,
    );
    expect(screen.getByText("Child content")).toBeVisible();
  });

  test("applies collapsed max-height", () => {
    const { container } = render(
      <ModelListBody collapsed>
        <span>Content</span>
      </ModelListBody>,
    );
    expect(container.firstChild).toHaveStyle("max-height: calc(100% - 38px)");
  });

  test("applies expanded max-height", () => {
    const { container } = render(
      <ModelListBody collapsed={false}>
        <span>Content</span>
      </ModelListBody>,
    );
    expect(container.firstChild).toHaveStyle("max-height: calc(100% - 60px)");
  });

  test("hides horizontal overflow", () => {
    const { container } = render(
      <ModelListBody collapsed={false}>
        <span>Content</span>
      </ModelListBody>,
    );
    expect(container.firstChild).toHaveStyle({
      "overflow-x": "hidden",
      "overflow-y": "auto",
    });
  });
});
