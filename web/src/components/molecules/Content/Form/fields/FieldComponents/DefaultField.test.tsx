import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import DefaultField from "./DefaultField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Text",
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
      <DefaultField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("DefaultField", () => {
  test("renders single input with field title", () => {
    renderField({ title: "My Text" });
    expect(screen.getByText("My Text")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Enter some text here" });
    expect(screen.getByText("Enter some text here")).toBeVisible();
  });

  test("renders unique badge and title tag", () => {
    renderField({ unique: true, isTitle: true });
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("renders input as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
