import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import URLField from "./URLField";

vi.mock("@reearth-cms/components/molecules/Common/MultiValueField", () => ({
  default: (props: { disabled?: boolean; required?: boolean; errorIndexes?: Set<number> }) => (
    <div
      data-testid="multi-value-field"
      data-disabled={props.disabled}
      data-required={props.required}
      data-error-indexes={props.errorIndexes ? JSON.stringify([...props.errorIndexes]) : undefined}
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
  const {
    fieldOverrides,
    disabled = false,
    itemGroupId,
    itemHeights,
    onItemHeightChange,
  } = options;
  formInstance = undefined;
  render(
    <FormCapture>
      <URLField
        field={makeField(fieldOverrides)}
        disabled={disabled}
        itemGroupId={itemGroupId}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
      />
    </FormCapture>,
  );
};

describe("URLField", () => {
  test("renders single input with field title", () => {
    renderField({ fieldOverrides: { title: "Website" } });
    expect(screen.getByText("Website")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ fieldOverrides: { description: "Enter a URL" } });
    expect(screen.getByText("Enter a URL")).toBeVisible();
  });

  test("renders input as disabled", () => {
    renderField({ disabled: true });
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ fieldOverrides: { multiple: true } });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByTestId("multi-value-field")).toBeInTheDocument();
  });

  test("renders unique badge and title tag", () => {
    renderField({ fieldOverrides: { unique: true, isTitle: true } });
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("itemGroupId produces compound form name", () => {
    renderField({ itemGroupId: "group-1" });
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue(["field-1", "group-1"], "https://example.com");
    const values = formInstance.getFieldsValue(true);
    expect(values).toHaveProperty(["field-1", "group-1"], "https://example.com");
  });

  test("URL validator rejects invalid URL", async () => {
    renderField();
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", "not-a-url");
    await expect(formInstance.validateFields()).rejects.toBeDefined();
  });

  test("URL validator resolves valid URL", async () => {
    renderField();
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", "https://example.com");
    await expect(formInstance.validateFields()).resolves.toBeDefined();
  });

  test("URL validator rejects invalid URL in array", async () => {
    renderField();
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", ["https://example.com", "bad-url"]);
    await expect(formInstance.validateFields()).rejects.toBeDefined();
  });

  test("URL validator resolves null value", async () => {
    renderField();
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", null);
    await expect(formInstance.validateFields()).resolves.toBeDefined();
  });

  test("forwards itemHeights and onItemHeightChange to ResponsiveHeight", () => {
    const heights = { "item-1": 100 };
    const handler = vi.fn();
    renderField({
      fieldOverrides: { multiple: true },
      itemHeights: heights,
      onItemHeightChange: handler,
    });
    const el = screen.getByTestId("responsive-height");
    expect(el).toHaveAttribute("data-item-heights", JSON.stringify(heights));
    expect(el).toHaveAttribute("data-on-item-height-change", "true");
  });

  test("passes disabled, required, and errorIndexes to MultiValueField", () => {
    renderField({
      fieldOverrides: { multiple: true, required: true },
      disabled: true,
    });
    const el = screen.getByTestId("multi-value-field");
    expect(el).toHaveAttribute("data-disabled", "true");
    expect(el).toHaveAttribute("data-required", "true");
  });
});
