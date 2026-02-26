import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import { renderTitle } from ".";

import type { Field } from "@reearth-cms/components/molecules/Schema/types";

const baseField: Field = {
  id: "field-1",
  type: "Text",
  title: "My Field Title",
  key: "my-field-title",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
};

describe("renderTitle", () => {
  test("renders field title with edit icon", () => {
    const { container } = render(<>{renderTitle(baseField)}</>);
    expect(screen.getByText("My Field Title")).toBeVisible();
    // The edit icon is an SVG rendered by the Icon component
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("renders different field title", () => {
    render(<>{renderTitle({ ...baseField, title: "Another Title" })}</>);
    expect(screen.getByText("Another Title")).toBeVisible();
  });
});
