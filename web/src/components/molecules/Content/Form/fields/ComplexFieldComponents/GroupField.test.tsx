import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

// GroupItem imports FieldTypesMap which transitively imports monaco-editor.
// Mock both child components to avoid jsdom incompatibility with monaco-editor.
vi.mock("@reearth-cms/components/molecules/Common/Form/GroupItem", () => ({
  default: ({ parentField, onGroupGet }: { parentField: Field; onGroupGet: (id: string) => void }) => {
    if (parentField?.typeProperty?.groupId) onGroupGet(parentField.typeProperty.groupId);
    return <div data-testid="mock-group-item" />;
  },
}));

vi.mock("@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGroup", () => ({
  default: ({ disabled }: { disabled?: boolean }) =>
    disabled ? (
      <div data-testid="mock-multi-value-group" />
    ) : (
      <div data-testid="mock-multi-value-group">
        <button data-testid={DATA_TEST_ID.FieldModal__PlusNewButton}>New</button>
      </div>
    ),
}));

import GroupField from "./GroupField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Group",
  title: "Test Field",
  key: "test-field",
  description: "Test description",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  typeProperty: { groupId: "g1" },
  ...overrides,
});

const buildGroupProps = () => ({
  onGroupGet: vi.fn().mockResolvedValue(undefined),
  assetProps: { onGetAsset: vi.fn().mockResolvedValue(undefined) },
  referenceProps: { referencedItems: [] as never[] },
});

describe("GroupField", () => {
  test("renders field title and description", () => {
    render(
      <Form>
        <GroupField field={makeField()} disabled={false} {...buildGroupProps()} />
      </Form>,
    );
    expect(screen.getByText("Test Field")).toBeVisible();
    expect(screen.getByText("Test description")).toBeVisible();
  });

  test("renders FieldTitle unique indicator and Title tag", () => {
    render(
      <Form>
        <GroupField
          field={makeField({ unique: true, isTitle: true })}
          disabled={false}
          {...buildGroupProps()}
        />
      </Form>,
    );
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("calls onGroupGet with groupId on mount (single mode)", () => {
    const props = buildGroupProps();
    render(
      <Form>
        <GroupField field={makeField()} disabled={false} {...props} />
      </Form>,
    );
    expect(props.onGroupGet).toHaveBeenCalledWith("g1");
  });

  test("renders New button when field.multiple=true", () => {
    render(
      <Form>
        <GroupField field={makeField({ multiple: true })} disabled={false} {...buildGroupProps()} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });

  test("multiple mode hides New button when disabled=true", () => {
    render(
      <Form>
        <GroupField field={makeField({ multiple: true })} disabled={true} {...buildGroupProps()} />
      </Form>,
    );
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).not.toBeInTheDocument();
  });
});
