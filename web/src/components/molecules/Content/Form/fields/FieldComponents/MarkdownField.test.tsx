import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import MarkdownField from "./MarkdownField";

vi.mock("@reearth-cms/components/atoms/Markdown", () => ({
  default: (props: { disabled?: boolean; maxLength?: number; required?: boolean }) => (
    <div
      data-testid="markdown-input"
      data-disabled={props.disabled}
      data-maxlength={props.maxLength}
      data-required={props.required}
    />
  ),
}));

vi.mock("@reearth-cms/components/molecules/Common/MultiValueField", () => ({
  default: (props: { maxLength?: number; disabled?: boolean; required?: boolean }) => (
    <div
      data-testid="multi-value-field"
      data-maxlength={props.maxLength}
      data-disabled={props.disabled}
      data-required={props.required}
    />
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

  test("renders unique badge and title tag", () => {
    renderField({ unique: true, isTitle: true });
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("passes maxLength from typeProperty to MarkdownInput", () => {
    renderField({ typeProperty: { maxLength: 200 } });
    expect(screen.getByTestId("markdown-input")).toHaveAttribute("data-maxlength", "200");
  });

  test("passes required prop to MarkdownInput", () => {
    renderField({ required: true });
    expect(screen.getByTestId("markdown-input")).toHaveAttribute("data-required", "true");
  });

  test("passes props to MultiValueField when multiple", () => {
    renderField({ multiple: true, required: true, typeProperty: { maxLength: 150 } }, true);
    const el = screen.getByTestId("multi-value-field");
    expect(el).toHaveAttribute("data-maxlength", "150");
    expect(el).toHaveAttribute("data-disabled", "true");
    expect(el).toHaveAttribute("data-required", "true");
  });
});
