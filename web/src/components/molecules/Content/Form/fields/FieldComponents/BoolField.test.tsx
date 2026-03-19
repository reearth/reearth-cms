import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import BoolField from "./BoolField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Bool",
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
      <BoolField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("BoolField", () => {
  test("renders single switch with field title", () => {
    renderField({ title: "Active" });
    expect(screen.getByText("Active")).toBeVisible();
    expect(screen.getByRole("switch")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Toggle this option" });
    expect(screen.getByText("Toggle this option")).toBeVisible();
  });

  test("renders switch as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  test("renders MultiValueBooleanField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });
});
