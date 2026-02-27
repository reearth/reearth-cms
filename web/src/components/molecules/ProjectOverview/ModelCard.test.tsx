import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ExportFormat } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import ModelCard, { Props } from "./ModelCard";

const user = userEvent.setup();

const buildProps = (overrides: Partial<Props> = {}): Props => ({
  exportLoading: false,
  hasContentCreateRight: true,
  hasDeleteRight: true,
  hasSchemaCreateRight: true,
  hasUpdateRight: true,
  model: {
    description: "test description",
    id: "test-id",
    key: "test-key",
    metadataSchema: {},
    name: "test model",
    order: 1,
    schema: {
      fields: [],
      id: "test-schema-id",
    },
    schemaId: "test-schema-id",
  },
  onContentNavigate: vi.fn(),
  onImportContentNavigate: vi.fn(),
  onImportSchemaNavigate: vi.fn(),
  onModelDeletionModalOpen: vi.fn().mockResolvedValue(undefined),
  onModelExport: vi.fn().mockResolvedValue(undefined),
  onModelUpdateModalOpen: vi.fn().mockResolvedValue(undefined),
  onSchemaNavigate: vi.fn(),
  ...overrides,
});

const openDropdown = async () => {
  await user.click(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownIcon));
  await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownEdit);
};

const openSubmenu = async (testId: DATA_TEST_ID) => {
  const submenu = screen.getByTestId(testId);
  const trigger = within(submenu).getByRole("menuitem");
  await user.hover(trigger);
};

describe("Test ModelCard component", () => {
  test("Renders model details and utility menu", async () => {
    render(<ModelCard {...buildProps()} />);

    expect(screen.getByText("test model")).toBeVisible();
    expect(screen.getByText("test description")).toBeVisible();

    await openDropdown();

    expect(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownEdit)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownImport)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExport)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownDelete)).toBeInTheDocument();
  });

  test("Fires menu actions when enabled", async () => {
    const props = buildProps();
    render(<ModelCard {...props} />);

    await openDropdown();
    await user.click(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownEdit));

    expect(props.onModelUpdateModalOpen).toHaveBeenCalledWith(props.model);

    await openDropdown();
    await user.click(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownDelete));

    expect(props.onModelDeletionModalOpen).toHaveBeenCalledWith(props.model);

    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownExport);
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentJSON),
    );

    expect(props.onModelExport).toHaveBeenCalledWith(props.model.id, ExportFormat.Json);
  });

  test("Toggles import options based on schema fields", async () => {
    const baseProps = buildProps();
    const withFields = buildProps({
      model: {
        ...baseProps.model,
        schema: {
          fields: [
            {
              description: "",
              id: "field-1",
              isTitle: false,
              key: "title",
              multiple: false,
              required: false,
              title: "Title",
              type: SchemaFieldType.Text,
              unique: false,
            },
          ],
          id: "test-schema-id",
        },
      },
    });

    render(<ModelCard {...withFields} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownImport);

    const importSchema = await screen.findByTestId(
      DATA_TEST_ID.ModelCard__UtilDropdownImportSchema,
    );
    const importContent = await screen.findByTestId(
      DATA_TEST_ID.ModelCard__UtilDropdownImportContent,
    );

    expect(importSchema).toHaveClass("ant-dropdown-menu-item-disabled");
    expect(importContent).not.toHaveClass("ant-dropdown-menu-item-disabled");
  });

  test("Disables import content when schema is empty", async () => {
    render(<ModelCard {...buildProps()} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownImport);

    const importSchema = await screen.findByTestId(
      DATA_TEST_ID.ModelCard__UtilDropdownImportSchema,
    );
    const importContent = await screen.findByTestId(
      DATA_TEST_ID.ModelCard__UtilDropdownImportContent,
    );

    expect(importSchema).not.toHaveClass("ant-dropdown-menu-item-disabled");
    expect(importContent).toHaveClass("ant-dropdown-menu-item-disabled");
  });
});
