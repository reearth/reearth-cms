import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import TagField from "./TagField";

const makeTags = () => [
  { id: "tag-1", name: "Bug", color: "Red" },
  { id: "tag-2", name: "Feature", color: "Blue" },
];

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Tag",
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
      <TagField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("TagField", () => {
  test("renders single select with field title", () => {
    renderField({ title: "Priority" });
    expect(screen.getByText("Priority")).toBeVisible();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Select a tag" });
    expect(screen.getByText("Select a tag")).toBeVisible();
  });

  test("renders select as disabled", () => {
    renderField({}, true);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  test("renders tag options from typeProperty", async () => {
    const user = userEvent.setup();
    renderField({ typeProperty: { tags: makeTags() } });
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText("Bug")).toBeInTheDocument();
    expect(screen.getByText("Feature")).toBeInTheDocument();
  });

  test("renders multiple select mode when multiple is true", () => {
    renderField({ multiple: true, typeProperty: { tags: makeTags() } });
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
