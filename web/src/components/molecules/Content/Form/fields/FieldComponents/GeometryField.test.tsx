import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import GeometryField from "./GeometryField";

vi.mock("@reearth-cms/components/molecules/Common/Form/GeometryItem", () => ({
  default: (props: { disabled?: boolean }) => (
    <div data-testid="geometry-item" data-disabled={props.disabled} />
  ),
}));

vi.mock(
  "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry",
  () => ({
    default: () => <div data-testid="multi-value-geometry" />,
  }),
);

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "GeometryObject",
  title: "Test Field",
  key: "test-field",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

const renderField = (fieldOverrides?: Partial<Field>, disabled = false) => {
  render(
    <Form>
      <GeometryField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("GeometryField", () => {
  test("renders geometry item with field title", () => {
    renderField({ title: "Location" });
    expect(screen.getByText("Location")).toBeVisible();
    expect(screen.getByTestId("geometry-item")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Draw a shape" });
    expect(screen.getByText("Draw a shape")).toBeVisible();
  });

  test("renders as disabled", () => {
    renderField({}, true);
    expect(screen.getByTestId("geometry-item")).toHaveAttribute("data-disabled", "true");
  });

  test("renders MultiValueGeometry when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByTestId("geometry-item")).not.toBeInTheDocument();
    expect(screen.getByTestId("multi-value-geometry")).toBeInTheDocument();
  });
});
