import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form, { FormInstance } from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";

import GeometryField from "./GeometryField";

let capturedGeometryItemProps: { errorAdd?: () => void; errorDelete?: () => void } = {};

vi.mock("@reearth-cms/components/molecules/Common/Form/GeometryItem", () => ({
  default: (props: {
    supportedTypes?: unknown;
    isEditor?: boolean;
    disabled?: boolean;
    errorAdd?: () => void;
    errorDelete?: () => void;
  }) => {
    capturedGeometryItemProps = { errorAdd: props.errorAdd, errorDelete: props.errorDelete };
    return (
      <div
        data-testid="geometry-item"
        data-supported-types={
          props.supportedTypes ? JSON.stringify(props.supportedTypes) : undefined
        }
        data-is-editor={props.isEditor}
        data-disabled={props.disabled}
        data-error-add={props.errorAdd ? "true" : undefined}
        data-error-delete={props.errorDelete ? "true" : undefined}
      />
    );
  },
}));

vi.mock("@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry", () => ({
  default: (props: {
    supportedTypes?: unknown;
    isEditor?: boolean;
    disabled?: boolean;
    errorAdd?: (index: number) => void;
    errorDelete?: (index: number) => void;
  }) => {
    return (
      <div
        data-testid="multi-value-geometry"
        data-supported-types={
          props.supportedTypes ? JSON.stringify(props.supportedTypes) : undefined
        }
        data-is-editor={props.isEditor}
        data-disabled={props.disabled}
        data-error-add={props.errorAdd ? "true" : undefined}
        data-error-delete={props.errorDelete ? "true" : undefined}
      />
    );
  },
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
  type: "GeometryObject",
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
  capturedGeometryItemProps = {};
  render(
    <FormCapture>
      <GeometryField
        field={makeField(fieldOverrides)}
        disabled={disabled}
        itemGroupId={itemGroupId}
        itemHeights={itemHeights}
        onItemHeightChange={onItemHeightChange}
      />
    </FormCapture>,
  );
};

describe("GeometryField", () => {
  test("renders geometry item with field title", () => {
    renderField({ fieldOverrides: { title: "Location" } });
    expect(screen.getByText("Location")).toBeVisible();
    expect(screen.getByTestId("geometry-item")).toBeInTheDocument();
  });

  test("renders description as extra text", () => {
    renderField({ fieldOverrides: { description: "Draw a shape" } });
    expect(screen.getByText("Draw a shape")).toBeVisible();
  });

  test("renders as disabled", () => {
    renderField({ disabled: true });
    expect(screen.getByTestId("geometry-item")).toHaveAttribute("data-disabled", "true");
  });

  test("renders MultiValueGeometry when multiple is true", () => {
    renderField({ fieldOverrides: { multiple: true } });
    expect(screen.queryByTestId("geometry-item")).not.toBeInTheDocument();
    expect(screen.getByTestId("multi-value-geometry")).toBeInTheDocument();
  });

  test("supportedTypes from objectSupportedTypes", () => {
    const types = ["POINT", "LINESTRING"];
    renderField({ fieldOverrides: { typeProperty: { objectSupportedTypes: types } } });
    expect(screen.getByTestId("geometry-item")).toHaveAttribute(
      "data-supported-types",
      JSON.stringify(types),
    );
  });

  test("supportedTypes falls back to first editorSupportedTypes", () => {
    const editorTypes = [["POINT", "POLYGON"]];
    renderField({
      fieldOverrides: { typeProperty: { editorSupportedTypes: editorTypes } },
    });
    expect(screen.getByTestId("geometry-item")).toHaveAttribute(
      "data-supported-types",
      JSON.stringify(editorTypes[0]),
    );
  });

  test("isEditor true when type is GeometryEditor", () => {
    renderField({ fieldOverrides: { type: "GeometryEditor" } });
    expect(screen.getByTestId("geometry-item")).toHaveAttribute("data-is-editor", "true");
  });

  test("isEditor false when type is GeometryObject", () => {
    renderField({ fieldOverrides: { type: "GeometryObject" } });
    expect(screen.getByTestId("geometry-item")).toHaveAttribute("data-is-editor", "false");
  });

  test("itemGroupId produces compound form name", () => {
    renderField({ itemGroupId: "group-1" });
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue(["field-1", "group-1"], "some-geom");
    const values = formInstance.getFieldsValue(true);
    expect(values).toHaveProperty(["field-1", "group-1"], "some-geom");
  });

  test("renders unique badge and Title tag", () => {
    renderField({ fieldOverrides: { unique: true, isTitle: true, title: "Geo" } });
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("required validation rejects empty value", async () => {
    renderField({ fieldOverrides: { required: true } });
    expect(formInstance).toBeDefined();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", undefined);
    await expect(formInstance.validateFields()).rejects.toBeDefined();
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

  test("passes supportedTypes, isEditor, disabled to MultiValueGeometry", () => {
    const types = ["POLYGON"];
    renderField({
      fieldOverrides: {
        multiple: true,
        type: "GeometryEditor",
        typeProperty: { objectSupportedTypes: types },
      },
      disabled: true,
    });
    const el = screen.getByTestId("multi-value-geometry");
    expect(el).toHaveAttribute("data-supported-types", JSON.stringify(types));
    expect(el).toHaveAttribute("data-is-editor", "true");
    expect(el).toHaveAttribute("data-disabled", "true");
    expect(el).toHaveAttribute("data-error-add", "true");
    expect(el).toHaveAttribute("data-error-delete", "true");
  });

  test("passes supportedTypes, isEditor, disabled to GeometryItem", () => {
    const types = ["POINT"];
    renderField({
      fieldOverrides: {
        type: "GeometryEditor",
        typeProperty: { objectSupportedTypes: types },
      },
      disabled: true,
    });
    const el = screen.getByTestId("geometry-item");
    expect(el).toHaveAttribute("data-supported-types", JSON.stringify(types));
    expect(el).toHaveAttribute("data-is-editor", "true");
    expect(el).toHaveAttribute("data-disabled", "true");
    expect(el).toHaveAttribute("data-error-add", "true");
    expect(el).toHaveAttribute("data-error-delete", "true");
  });

  test("errorSet validation rejects when errorAdd has been called", async () => {
    renderField();
    expect(capturedGeometryItemProps.errorAdd).toBeDefined();
    capturedGeometryItemProps.errorAdd?.();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", "valid-geom");
    await expect(formInstance.validateFields()).rejects.toBeDefined();
  });

  test("errorSet validation resolves after errorDelete clears errors", async () => {
    renderField();
    capturedGeometryItemProps.errorAdd?.();
    capturedGeometryItemProps.errorDelete?.();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", "valid-geom");
    await expect(formInstance.validateFields()).resolves.toBeDefined();
  });

  test("single GeometryItem errorAdd wraps with index 0", async () => {
    renderField();
    capturedGeometryItemProps.errorAdd?.();
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", "valid-geom");
    await expect(formInstance.validateFields()).rejects.toBeDefined();
    capturedGeometryItemProps.errorDelete?.();
    await expect(formInstance.validateFields()).resolves.toBeDefined();
  });

  test("supportedTypes is undefined when typeProperty is absent", () => {
    renderField({ fieldOverrides: { typeProperty: undefined } });
    expect(screen.getByTestId("geometry-item")).not.toHaveAttribute("data-supported-types");
  });

  test("objectSupportedTypes wins when both type sources are present", () => {
    const objectTypes = ["POINT", "LINESTRING"];
    const editorTypes = [["POLYGON", "MULTIPOLYGON"]];
    renderField({
      fieldOverrides: {
        typeProperty: {
          objectSupportedTypes: objectTypes,
          editorSupportedTypes: editorTypes,
        },
      },
    });
    expect(screen.getByTestId("geometry-item")).toHaveAttribute(
      "data-supported-types",
      JSON.stringify(objectTypes),
    );
  });

  test("non-required field passes validation with empty value", async () => {
    renderField({ fieldOverrides: { required: false } });
    if (!formInstance) return;
    formInstance.setFieldValue("field-1", undefined);
    await expect(formInstance.validateFields()).resolves.toBeDefined();
  });
});
