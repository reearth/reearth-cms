import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import type { Field, Schema } from "@reearth-cms/components/molecules/Schema/types";

import RequestItemForm from "./ItemForm";

const MockAssetField = vi.fn(({ field, disabled, onGetAsset }: Record<string, unknown>) => (
  <div
    data-testid="mock-asset-field"
    data-field-id={String(field && (field as Field).id)}
    data-disabled={String(disabled)}
    data-has-on-get-asset={String(typeof onGetAsset === "function")}
  />
));

const MockReferenceField = vi.fn(
  ({ field, disabled, referencedItems }: Record<string, unknown>) => (
    <div
      data-testid="mock-reference-field"
      data-field-id={String(field && (field as Field).id)}
      data-disabled={String(disabled)}
      data-has-referenced-items={String(Array.isArray(referencedItems))}
    />
  ),
);

const MockGroupField = vi.fn(
  ({ field, disabled, onGroupGet, assetProps, referenceProps }: Record<string, unknown>) => (
    <div
      data-testid="mock-group-field"
      data-field-id={String(field && (field as Field).id)}
      data-disabled={String(disabled)}
      data-has-on-group-get={String(typeof onGroupGet === "function")}
      data-has-asset-props={String(assetProps != null)}
      data-has-reference-props={String(referenceProps != null)}
    />
  ),
);

const MockMappedComponent = vi.fn(({ field, disabled }: Record<string, unknown>) => (
  <div
    data-testid={`mock-mapped-${field && (field as Field).type}`}
    data-field-id={String(field && (field as Field).id)}
    data-disabled={String(disabled)}
  />
));

vi.mock("@reearth-cms/components/molecules/Content/Form/fields/ComplexFieldComponents", () => ({
  AssetField: (props: Record<string, unknown>) => MockAssetField(props),
  ReferenceField: (props: Record<string, unknown>) => MockReferenceField(props),
  GroupField: (props: Record<string, unknown>) => MockGroupField(props),
}));

vi.mock("@reearth-cms/components/molecules/Content/Form/fields/FieldTypesMap", () => ({
  FIELD_TYPE_COMPONENT_MAP: new Proxy(
    {},
    {
      get: (_target, prop) => {
        return (props: Record<string, unknown>) =>
          MockMappedComponent({ ...props, type: String(prop) });
      },
    },
  ),
}));

const makeField = (overrides: Partial<Field> & { id: string; type: Field["type"] }): Field => ({
  title: "Test Field",
  key: "test-field",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

const makeSchema = (fields: Field[]): Schema => ({
  id: "schema-1",
  fields,
});

const defaultProps = {
  initialFormValues: {},
  referencedItems: [],
  onGetAsset: vi.fn().mockResolvedValue(undefined),
  onGroupGet: vi.fn().mockResolvedValue(undefined),
};

describe("RequestItemForm", () => {
  test("renders empty when schema is undefined", () => {
    const { container } = render(<RequestItemForm {...defaultProps} schema={undefined} />);
    expect(container.querySelector("form")).toBeInTheDocument();
    expect(screen.queryByTestId(/mock-/)).not.toBeInTheDocument();
  });

  test("renders empty when schema.fields is empty", () => {
    const { container } = render(<RequestItemForm {...defaultProps} schema={makeSchema([])} />);
    expect(container.querySelector("form")).toBeInTheDocument();
    expect(screen.queryByTestId(/mock-/)).not.toBeInTheDocument();
  });

  test("routes Asset field to AssetField", () => {
    const schema = makeSchema([makeField({ id: "f-asset", type: "Asset" })]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    const el = screen.getByTestId("mock-asset-field");
    expect(el).toHaveAttribute("data-field-id", "f-asset");
  });

  test("routes Reference field to ReferenceField", () => {
    const schema = makeSchema([makeField({ id: "f-ref", type: "Reference" })]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    const el = screen.getByTestId("mock-reference-field");
    expect(el).toHaveAttribute("data-field-id", "f-ref");
  });

  test("routes Group field to GroupField", () => {
    const schema = makeSchema([makeField({ id: "f-group", type: "Group" })]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    const el = screen.getByTestId("mock-group-field");
    expect(el).toHaveAttribute("data-field-id", "f-group");
  });

  test.each([
    "Text",
    "TextArea",
    "MarkdownText",
    "Date",
    "Bool",
    "Checkbox",
    "URL",
    "Integer",
    "Number",
    "Select",
    "Tag",
    "GeometryObject",
    "GeometryEditor",
  ] as const)("routes %s field to FIELD_TYPE_COMPONENT_MAP", fieldType => {
    const schema = makeSchema([makeField({ id: `f-${fieldType}`, type: fieldType })]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    const el = screen.getByTestId(`mock-mapped-${fieldType}`);
    expect(el).toHaveAttribute("data-field-id", `f-${fieldType}`);
  });

  test("all fields are rendered with disabled=true", () => {
    const schema = makeSchema([
      makeField({ id: "f1", type: "Asset" }),
      makeField({ id: "f2", type: "Reference" }),
      makeField({ id: "f3", type: "Group" }),
      makeField({ id: "f4", type: "Text" }),
    ]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    expect(screen.getByTestId("mock-asset-field")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("mock-reference-field")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("mock-group-field")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByTestId("mock-mapped-Text")).toHaveAttribute("data-disabled", "true");
  });

  test("AssetField receives onGetAsset", () => {
    const onGetAsset = vi.fn();
    const schema = makeSchema([makeField({ id: "f1", type: "Asset" })]);
    render(<RequestItemForm {...defaultProps} schema={schema} onGetAsset={onGetAsset} />);
    expect(screen.getByTestId("mock-asset-field")).toHaveAttribute("data-has-on-get-asset", "true");
  });

  test("ReferenceField receives referencedItems", () => {
    const schema = makeSchema([makeField({ id: "f1", type: "Reference" })]);
    render(
      <RequestItemForm
        {...defaultProps}
        schema={schema}
        referencedItems={[
          {
            id: "item-1",
            title: "Item 1",
            schemaId: "s1",
            createdBy: "u1",
            status: "DRAFT",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]}
      />,
    );
    expect(screen.getByTestId("mock-reference-field")).toHaveAttribute(
      "data-has-referenced-items",
      "true",
    );
  });

  test("GroupField receives onGroupGet, assetProps, and referenceProps", () => {
    const schema = makeSchema([makeField({ id: "f1", type: "Group" })]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    const el = screen.getByTestId("mock-group-field");
    expect(el).toHaveAttribute("data-has-on-group-get", "true");
    expect(el).toHaveAttribute("data-has-asset-props", "true");
    expect(el).toHaveAttribute("data-has-reference-props", "true");
  });

  test("renders multiple fields from schema", () => {
    const schema = makeSchema([
      makeField({ id: "f1", type: "Text" }),
      makeField({ id: "f2", type: "Asset" }),
      makeField({ id: "f3", type: "Bool" }),
      makeField({ id: "f4", type: "Reference" }),
      makeField({ id: "f5", type: "Group" }),
    ]);
    render(<RequestItemForm {...defaultProps} schema={schema} />);
    expect(screen.getByTestId("mock-mapped-Text")).toBeInTheDocument();
    expect(screen.getByTestId("mock-asset-field")).toBeInTheDocument();
    expect(screen.getByTestId("mock-mapped-Bool")).toBeInTheDocument();
    expect(screen.getByTestId("mock-reference-field")).toBeInTheDocument();
    expect(screen.getByTestId("mock-group-field")).toBeInTheDocument();
  });
});
