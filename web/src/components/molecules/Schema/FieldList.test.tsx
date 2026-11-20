import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { t } from "@reearth-cms/i18n";
import { DATA_TEST_ID, Test } from "@reearth-cms/test/utils";

import FieldList from "./FieldList";

type Props = React.ComponentProps<typeof FieldList>;

const user = userEvent.setup();

const buildProps = (overrides: Partial<Props> = {}): Props => ({
  currentTab: "fields",
  selectedSchemaType: "model",
  hasCreateRight: true,
  addField: vi.fn(),
  ...overrides,
});

const getFieldItem = (fieldType: SchemaFieldType): HTMLElement =>
  screen.getByTestId(Test.getDataTestIdFromSchemaFieldType(fieldType));

describe("FieldList", () => {
  test("shows the New tag, not the Deprecated tag, on Geometry", () => {
    render(<FieldList {...buildProps()} />);

    const item = within(getFieldItem(SchemaFieldType.Geometry));
    expect(item.getByText(t("New", { context: "badge" }))).toBeInTheDocument();
    expect(item.queryByText(t("Deprecated", { context: "badge" }))).not.toBeInTheDocument();
  });

  test.each([SchemaFieldType.GeometryObject, SchemaFieldType.GeometryEditor])(
    "shows the Deprecated tag, not the New tag, on %s",
    fieldType => {
      render(<FieldList {...buildProps()} />);

      const item = within(getFieldItem(fieldType));
      expect(item.getByText(t("Deprecated", { context: "badge" }))).toBeInTheDocument();
      expect(item.queryByText(t("New", { context: "badge" }))).not.toBeInTheDocument();
    },
  );

  test.each([SchemaFieldType.Text, SchemaFieldType.Geometry])(
    "adds %s directly without the PopConfirm",
    async fieldType => {
      const addField = vi.fn();
      render(<FieldList {...buildProps({ addField })} />);

      await user.click(getFieldItem(fieldType));

      expect(addField).toHaveBeenCalledExactlyOnceWith(fieldType);
      expect(
        screen.queryByTestId(DATA_TEST_ID.Schema__DeprecatedFieldPopConfirm__ContinueButton),
      ).not.toBeInTheDocument();
    },
  );

  test("adds the Geometry field when choosing to use the replacement", async () => {
    const addField = vi.fn();
    render(<FieldList {...buildProps({ addField })} />);

    await user.click(getFieldItem(SchemaFieldType.GeometryObject));
    expect(addField).not.toHaveBeenCalled();

    await user.click(
      await screen.findByTestId(
        DATA_TEST_ID.Schema__DeprecatedFieldPopConfirm__UseReplacementButton,
      ),
    );

    expect(addField).toHaveBeenCalledExactlyOnceWith(SchemaFieldType.Geometry);
  });

  test("adds the legacy field when choosing to continue", async () => {
    const addField = vi.fn();
    render(<FieldList {...buildProps({ addField })} />);

    await user.click(getFieldItem(SchemaFieldType.GeometryEditor));
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.Schema__DeprecatedFieldPopConfirm__ContinueButton),
    );

    expect(addField).toHaveBeenCalledExactlyOnceWith(SchemaFieldType.GeometryEditor);
  });

  test("does not open the PopConfirm without create right", async () => {
    const addField = vi.fn();
    render(<FieldList {...buildProps({ addField, hasCreateRight: false })} />);

    await user.click(getFieldItem(SchemaFieldType.GeometryObject));

    expect(
      screen.queryByTestId(DATA_TEST_ID.Schema__DeprecatedFieldPopConfirm__ContinueButton),
    ).not.toBeInTheDocument();
    expect(addField).not.toHaveBeenCalled();
  });
});
