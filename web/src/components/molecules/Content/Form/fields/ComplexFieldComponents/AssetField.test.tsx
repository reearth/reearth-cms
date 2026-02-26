import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import type { Field } from "@reearth-cms/components/molecules/Schema/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import AssetField from "./AssetField";

const makeField = (overrides?: Partial<Field>): Field => ({
  id: "field-1",
  type: "Asset",
  title: "Test Field",
  key: "test-field",
  description: "Test description",
  required: false,
  unique: false,
  multiple: false,
  isTitle: false,
  ...overrides,
});

const buildAssetProps = () => ({
  onGetAsset: vi.fn().mockResolvedValue(undefined),
});

describe("AssetField", () => {
  test("renders field title and description", () => {
    render(
      <Form>
        <AssetField field={makeField()} disabled={false} {...buildAssetProps()} />
      </Form>,
    );
    expect(screen.getByText("Test Field")).toBeVisible();
    expect(screen.getByText("Test description")).toBeVisible();
  });

  test("renders FieldTitle unique indicator and Title tag", () => {
    render(
      <Form>
        <AssetField
          field={makeField({ unique: true, isTitle: true })}
          disabled={false}
          {...buildAssetProps()}
        />
      </Form>,
    );
    expect(screen.getByText("(unique)")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();
  });

  test("renders single asset button when not multiple", () => {
    render(
      <Form>
        <AssetField field={makeField()} disabled={false} {...buildAssetProps()} />
      </Form>,
    );
    expect(screen.getByRole("button", { name: /Asset/ })).toBeVisible();
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).not.toBeInTheDocument();
  });

  test("renders New button when field.multiple=true", () => {
    render(
      <Form>
        <AssetField
          field={makeField({ multiple: true })}
          disabled={false}
          {...buildAssetProps()}
        />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });

  test("single mode button disabled when disabled=true", () => {
    render(
      <Form>
        <AssetField field={makeField()} disabled={true} {...buildAssetProps()} />
      </Form>,
    );
    expect(screen.getByRole("button", { name: /Asset/ })).toBeDisabled();
  });

  test("multiple mode hides New button when disabled=true", () => {
    render(
      <Form>
        <AssetField
          field={makeField({ multiple: true })}
          disabled={true}
          {...buildAssetProps()}
        />
      </Form>,
    );
    expect(screen.queryByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).not.toBeInTheDocument();
  });
});
