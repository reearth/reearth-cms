import { render } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import type { Field as FieldType } from "@reearth-cms/components/molecules/Schema/types";

import FieldWrapper from "./FieldWrapper";

vi.mock("./Field", () => ({
  default: ({ field, disabled }: { field: FieldType; disabled: boolean }) => (
    <div data-testid="mock-field">{`${field.type}${disabled ? " (disabled)" : ""}`}</div>
  ),
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

describe("FieldWrapper", () => {
  test("renders Field component", () => {
    const { getByTestId } = render(
      <FieldWrapper field={makeField()} {...defaultProps()} />,
    );
    expect(getByTestId("mock-field")).toHaveTextContent("Text");
  });

  test("applies max-width 500px for standard types", () => {
    const { container } = render(
      <FieldWrapper field={makeField({ type: "Text" })} {...defaultProps()} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ maxWidth: "500px" });
  });

  test("does not apply max-width for Group type", () => {
    const { container } = render(
      <FieldWrapper field={makeField({ type: "Group" })} {...defaultProps()} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveStyle({ maxWidth: "500px" });
  });

  test("does not apply max-width for GeometryObject type", () => {
    const { container } = render(
      <FieldWrapper field={makeField({ type: "GeometryObject" })} {...defaultProps()} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveStyle({ maxWidth: "500px" });
  });

  test("does not apply max-width for GeometryEditor type", () => {
    const { container } = render(
      <FieldWrapper field={makeField({ type: "GeometryEditor" })} {...defaultProps()} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).not.toHaveStyle({ maxWidth: "500px" });
  });

  test("passes disabled prop through to Field", () => {
    const { getByTestId } = render(
      <FieldWrapper field={makeField()} {...defaultProps()} disabled={true} />,
    );
    expect(getByTestId("mock-field")).toHaveTextContent("Text (disabled)");
  });
});
