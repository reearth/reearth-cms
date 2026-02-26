import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import NumberField from "./NumberField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Integer",
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
      <NumberField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("NumberField", () => {
  test("renders single number input with field title", () => {
    renderField({ title: "Quantity" });
    expect(screen.getByText("Quantity")).toBeVisible();
    expect(screen.getByRole("spinbutton")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Enter a number" });
    expect(screen.getByText("Enter a number")).toBeVisible();
  });

  test("renders number input as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  test("passes min and max from typeProperty", () => {
    renderField({ typeProperty: { min: 0, max: 100 } });
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "100");
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });
});
