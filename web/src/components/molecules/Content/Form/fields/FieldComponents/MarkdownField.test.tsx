import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import MarkdownField from "./MarkdownField";

vi.mock("@reearth-cms/components/atoms/Markdown", () => ({
  default: (props: { disabled?: boolean }) => (
    <div data-testid="markdown-input" data-disabled={props.disabled} />
  ),
}));

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "MarkdownText",
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
      <MarkdownField field={makeField(fieldOverrides)} disabled={disabled} />
    </Form>,
  );
};

describe("MarkdownField", () => {
  test("renders markdown input with field title", () => {
    renderField({ title: "Content" });
    expect(screen.getByText("Content")).toBeVisible();
    expect(screen.getByTestId("markdown-input")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ description: "Write markdown here" });
    expect(screen.getByText("Write markdown here")).toBeVisible();
  });

  test("renders as disabled", () => {
    renderField({}, true);
    expect(screen.getByTestId("markdown-input")).toHaveAttribute("data-disabled", "true");
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ multiple: true });
    expect(screen.queryByTestId("markdown-input")).not.toBeInTheDocument();
  });
});
