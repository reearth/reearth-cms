import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import URLField from "./URLField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "URL",
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
      <URLField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("URLField", () => {
  test("renders single input with field title", () => {
    renderField({ title: "Website" });
    expect(screen.getByText("Website")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Enter a URL" });
    expect(screen.getByText("Enter a URL")).toBeVisible();
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
