import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
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

vi.mock("@reearth-cms/components/molecules/Content/Form/fields/ResponsiveHeight", () => ({
  default: (props: {
    children: React.ReactNode;
    itemHeights?: Record<string, number>;
    onItemHeightChange?: (id: string, height: number) => void;
  }) => (
    <div
      data-testid="responsive-height"
      data-item-heights={props.itemHeights ? JSON.stringify(props.itemHeights) : undefined}
      data-on-item-height-change={props.onItemHeightChange ? "true" : undefined}>
      {props.children}
    </div>
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

type RenderOptions = {
  fieldOverrides?: Partial<Field>;
  disabled?: boolean;
  itemGroupId?: string;
  itemHeights?: Record<string, number>;
  onItemHeightChange?: (id: string, height: number) => void;
};

let formInstance: FormInstance | undefined;

const FormCapture: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [form] = Form.useForm();
  formInstance = form;
  return <Form form={form}>{children}</Form>;
};

const renderField = (options: RenderOptions = {}) => {
  const { fieldOverrides, disabled = false, itemGroupId, itemHeights, onItemHeightChange } =
    options;
  formInstance = undefined;
  render(
    <FormCapture>
      <MarkdownField
        field={makeField(fieldOverrides)}
        disabled={disabled}
        itemGroupId={itemGroupId}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
      />
    </FormCapture>,
  );
};

describe("MarkdownField", () => {
  test("renders markdown input with field title", () => {
    renderField({ fieldOverrides: { title: "Content" } });
    expect(screen.getByText("Content")).toBeVisible();
    expect(screen.getByTestId("markdown-input")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ fieldOverrides: { description: "Write markdown here" } });
    expect(screen.getByText("Write markdown here")).toBeVisible();
  });

  test("renders as disabled", () => {
    renderField({ disabled: true });
    expect(screen.getByTestId("markdown-input")).toHaveAttribute("data-disabled", "true");
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ fieldOverrides: { multiple: true } });
    expect(screen.queryByTestId("markdown-input")).not.toBeInTheDocument();
  });

  test("renders unique badge and title tag", () => {
    renderField({ fieldOverrides: { unique: true, isTitle: true } });
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("passes maxLength from typeProperty to MarkdownInput", () => {
    renderField({ fieldOverrides: { typeProperty: { maxLength: 200 } } });
    expect(screen.getByTestId("markdown-input")).toHaveAttribute("data-maxlength", "200");
  });

  test("passes required prop to MarkdownInput", () => {
    renderField({ fieldOverrides: { required: true } });
    expect(screen.getByTestId("markdown-input")).toHaveAttribute("data-required", "true");
  });

  test("passes props to MultiValueField when multiple", () => {
    renderField({
      fieldOverrides: { multiple: true, required: true, typeProperty: { maxLength: 150 } },
      disabled: true,
    });
    const el = screen.getByTestId("multi-value-field");
    expect(el).toHaveAttribute("data-maxlength", "150");
    expect(el).toHaveAttribute("data-disabled", "true");
    expect(el).toHaveAttribute("data-required", "true");
  });

  test("itemGroupId produces compound form name", () => {
    renderField({ itemGroupId: "group-1" });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue(["field-1", "group-1"], "test-value");
    const values = formInstance!.getFieldsValue(true);
    expect(values).toHaveProperty(["field-1", "group-1"], "test-value");
  });

  test("maxLength validator rejects string exceeding limit", async () => {
    renderField({ fieldOverrides: { typeProperty: { maxLength: 5 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", "abcdef");
    await expect(formInstance!.validateFields()).rejects.toBeDefined();
  });

  test("maxLength validator resolves string within limit", async () => {
    renderField({ fieldOverrides: { typeProperty: { maxLength: 10 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", "abc");
    await expect(formInstance!.validateFields()).resolves.toBeDefined();
  });

  test("maxLength validator rejects array item exceeding limit", async () => {
    renderField({ fieldOverrides: { typeProperty: { maxLength: 3 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", ["ab", "abcd"]);
    await expect(formInstance!.validateFields()).rejects.toBeDefined();
  });

  test("maxLength validator resolves when value is null", async () => {
    renderField({ fieldOverrides: { typeProperty: { maxLength: 5 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", null);
    await expect(formInstance!.validateFields()).resolves.toBeDefined();
  });

  test("maxLength validator resolves when maxLength is undefined", async () => {
    renderField();
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", "a very long string that exceeds any reasonable limit");
    await expect(formInstance!.validateFields()).resolves.toBeDefined();
  });

  test("maxLength validator ignores non-string items in array", async () => {
    renderField({ fieldOverrides: { typeProperty: { maxLength: 3 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", [null, undefined, 12345]);
    await expect(formInstance!.validateFields()).resolves.toBeDefined();
  });

  test("forwards itemHeights and onItemHeightChange to ResponsiveHeight", () => {
    const heights = { "item-1": 100 };
    const handler = vi.fn();
    renderField({ itemHeights: heights, onItemHeightChange: handler });
    const el = screen.getByTestId("responsive-height");
    expect(el).toHaveAttribute("data-item-heights", JSON.stringify(heights));
    expect(el).toHaveAttribute("data-on-item-height-change", "true");
  });
});
