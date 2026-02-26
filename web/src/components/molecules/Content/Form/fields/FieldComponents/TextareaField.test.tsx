import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import TextareaField from "./TextareaField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "TextArea",
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
      <TextareaField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("TextareaField", () => {
  test("renders single textarea with field title", () => {
    renderField({ title: "Notes" });
    expect(screen.getByText("Notes")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Enter long text" });
    expect(screen.getByText("Enter long text")).toBeVisible();
  });

  test("renders textarea as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("renders with maxLength counter when set", () => {
    renderField({ typeProperty: { maxLength: 100 } });
    expect(screen.getByText("0 / 100")).toBeVisible();
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
