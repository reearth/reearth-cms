import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import CheckboxField from "./CheckboxField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Checkbox",
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
      <CheckboxField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("CheckboxField", () => {
  test("renders single checkbox with field title", () => {
    renderField({ title: "Agree" });
    expect(screen.getByText("Agree")).toBeVisible();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Check to agree" });
    expect(screen.getByText("Check to agree")).toBeVisible();
  });

  test("renders checkbox as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  test("renders MultiValueBooleanField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
