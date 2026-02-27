import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import DateField from "./DateField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Date",
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
      <DateField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("DateField", () => {
  test("renders single date picker with field title", () => {
    renderField({ title: "Start Date" });
    expect(screen.getByText("Start Date")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Pick a date" });
    expect(screen.getByText("Pick a date")).toBeVisible();
  });

  test("renders date picker as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
