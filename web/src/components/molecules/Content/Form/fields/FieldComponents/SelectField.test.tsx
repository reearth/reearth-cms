import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import SelectField from "./SelectField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Select",
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
      <SelectField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("SelectField", () => {
  test("renders single select with field title", () => {
    renderField({ title: "Category" });
    expect(screen.getByText("Category")).toBeVisible();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Choose a category" });
    expect(screen.getByText("Choose a category")).toBeVisible();
  });

  test("renders select as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  test("renders options from typeProperty values", async () => {
    const user = userEvent.setup();
    renderField({ typeProperty: { values: ["Alpha", "Beta", "Gamma"] } });
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByTitle("Alpha")).toBeInTheDocument();
    expect(screen.getByTitle("Beta")).toBeInTheDocument();
    expect(screen.getByTitle("Gamma")).toBeInTheDocument();
  });

  test("renders MultiValueSelect when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
