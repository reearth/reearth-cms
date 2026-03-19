import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field as FieldType } from "@reearth-cms/components/molecules/Schema/types";

import Field from "./Field";

vi.mock("./fields/ComplexFieldComponents", () => ({
  AssetField: ({ field }: { field: FieldType }) => (
    <div data-testid="mock-asset-field">{field.title}</div>
  ),
  ReferenceField: ({ field }: { field: FieldType }) => (
    <div data-testid="mock-reference-field">{field.title}</div>
  ),
  GroupField: ({ field }: { field: FieldType }) => (
    <div data-testid="mock-group-field">{field.title}</div>
  ),
}));

vi.mock("./fields/FieldTypesMap", () => ({
  FIELD_TYPE_COMPONENT_MAP: {
    Text: ({ field }: { field: FieldType }) => (
      <div data-testid="mock-text-field">{field.title}</div>
    ),
    Integer: ({ field }: { field: FieldType }) => (
      <div data-testid="mock-integer-field">{field.title}</div>
    ),
    GeometryObject: ({ field }: { field: FieldType }) => (
      <div data-testid="mock-geometry-field">{field.title}</div>
    ),
  },
}));

const makeField = (overrides?: Partial<FieldType>): FieldType => ({
  id: "field-1",
  type: "Text",
  title: "Test Field",
  key: "test-field",
  description: "",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

const defaultProps = () => ({
  disabled: false,
  assetProps: { onGetAsset: vi.fn().mockResolvedValue(undefined) } as never,
  referenceProps: { referencedItems: [] } as never,
  groupProps: { form: {} as never, onGroupGet: vi.fn().mockResolvedValue(undefined) },
});

const renderField = (fieldOverrides?: Partial<FieldType>) =>
  render(
    <MemoryRouter>
      <Form>
        <Field field={makeField(fieldOverrides)} {...defaultProps()} />
      </Form>
    </MemoryRouter>,
  );

describe("Field", () => {
  test("routes Asset type to AssetField component", () => {
    renderField({ type: "Asset", title: "My Asset" });
    expect(screen.getByTestId("mock-asset-field")).toHaveTextContent("My Asset");
  });

  test("routes Reference type to ReferenceField component", () => {
    renderField({ type: "Reference", title: "My Ref" });
    expect(screen.getByTestId("mock-reference-field")).toHaveTextContent("My Ref");
  });

  test("routes Group type to GroupField component", () => {
    renderField({ type: "Group", title: "My Group" });
    expect(screen.getByTestId("mock-group-field")).toHaveTextContent("My Group");
  });

  test("routes Text type to FIELD_TYPE_COMPONENT_MAP", () => {
    renderField({ type: "Text", title: "My Text" });
    expect(screen.getByTestId("mock-text-field")).toHaveTextContent("My Text");
  });

  test("routes Integer type to FIELD_TYPE_COMPONENT_MAP", () => {
    renderField({ type: "Integer", title: "My Int" });
    expect(screen.getByTestId("mock-integer-field")).toHaveTextContent("My Int");
  });

  test("routes GeometryObject type to FIELD_TYPE_COMPONENT_MAP", () => {
    renderField({ type: "GeometryObject", title: "My Geo" });
    expect(screen.getByTestId("mock-geometry-field")).toHaveTextContent("My Geo");
  });

  test("does not render Asset component for non-Asset type", () => {
    renderField({ type: "Text" });
    expect(screen.queryByTestId("mock-asset-field")).not.toBeInTheDocument();
  });

  test("does not render Reference component for non-Reference type", () => {
    renderField({ type: "Text" });
    expect(screen.queryByTestId("mock-reference-field")).not.toBeInTheDocument();
  });

  test("does not render Group component for non-Group type", () => {
    renderField({ type: "Text" });
    expect(screen.queryByTestId("mock-group-field")).not.toBeInTheDocument();
  });
});
