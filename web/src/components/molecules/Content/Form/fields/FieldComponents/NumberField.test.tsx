import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import NumberField from "./NumberField";

vi.mock("@reearth-cms/components/molecules/Common/MultiValueField", () => ({
  default: (props: { min?: number; max?: number; disabled?: boolean; type?: string }) => (
    <div
      data-testid="multi-value-field"
      data-min={props.min}
      data-max={props.max}
      data-disabled={props.disabled}
      data-type={props.type}
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
  type: "Integer",
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
      <NumberField
        field={makeField(fieldOverrides)}
        disabled={disabled}
        itemGroupId={itemGroupId}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
      />
    </FormCapture>,
  );
};

describe("NumberField", () => {
  test("renders single number input with field title", () => {
    renderField({ fieldOverrides: { title: "Quantity" } });
    expect(screen.getByText("Quantity")).toBeVisible();
    expect(screen.getByRole("spinbutton")).toBeVisible();
  });

  test("renders description as extra text", () => {
    renderField({ fieldOverrides: { description: "Enter a number" } });
    expect(screen.getByText("Enter a number")).toBeVisible();
  });

  test("renders number input as disabled", () => {
    renderField({ disabled: true });
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  test("passes min and max from typeProperty", () => {
    renderField({ fieldOverrides: { typeProperty: { min: 0, max: 100 } } });
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("aria-valuemin", "0");
    expect(input).toHaveAttribute("aria-valuemax", "100");
  });

  test("renders MultiValueField when multiple is true", () => {
    renderField({ fieldOverrides: { multiple: true } });
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  test("itemGroupId produces compound form name", () => {
    renderField({ itemGroupId: "group-1" });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue(["field-1", "group-1"], 42);
    const values = formInstance!.getFieldsValue(true);
    expect(values).toHaveProperty(["field-1", "group-1"], 42);
  });

  test("min/max validator rejects value below min", async () => {
    renderField({ fieldOverrides: { typeProperty: { min: 5 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", 3);
    await expect(formInstance!.validateFields()).rejects.toBeDefined();
  });

  test("min/max validator resolves value within range", async () => {
    renderField({ fieldOverrides: { typeProperty: { min: 1, max: 100 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", 50);
    await expect(formInstance!.validateFields()).resolves.toBeDefined();
  });

  test("min/max validator rejects value above max", async () => {
    renderField({ fieldOverrides: { typeProperty: { max: 10 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", 15);
    await expect(formInstance!.validateFields()).rejects.toBeDefined();
  });

  test("min/max validator rejects array item outside range", async () => {
    renderField({ fieldOverrides: { typeProperty: { max: 10 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", [5, 15]);
    await expect(formInstance!.validateFields()).rejects.toBeDefined();
  });

  test("min/max validator accepts null value", async () => {
    renderField({ fieldOverrides: { typeProperty: { min: 1, max: 100 } } });
    expect(formInstance).toBeDefined();
    formInstance!.setFieldValue("field-1", null);
    await expect(formInstance!.validateFields()).resolves.toBeDefined();
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

  test("passes min, max, and disabled to MultiValueField when multiple", () => {
    renderField({
      fieldOverrides: { multiple: true, typeProperty: { min: 1, max: 50 } },
      disabled: true,
    });
    const el = screen.getByTestId("multi-value-field");
    expect(el).toHaveAttribute("data-min", "1");
    expect(el).toHaveAttribute("data-max", "50");
    expect(el).toHaveAttribute("data-disabled", "true");
    expect(el).toHaveAttribute("data-type", "number");
  });
});
