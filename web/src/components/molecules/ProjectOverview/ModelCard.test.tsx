import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import ModelCard, { Props } from "./ModelCard";
import { ExportFormat } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

const user = userEvent.setup();

const buildProps = (overrides: Partial<Props> = {}): Props => ({
  model: {
    id: "test-id",
    name: "test model",
    description: "test description",
    key: "test-key",
    schemaId: "test-schema-id",
    schema: {
      id: "test-schema-id",
      fields: [],
    },
    metadataSchema: {},
    order: 1,
  },
  hasUpdateRight: true,
  hasDeleteRight: true,
  exportLoading: false,
  onSchemaNavigate: vi.fn(),
  onImportSchemaNavigate: vi.fn(),
  onContentNavigate: vi.fn(),
  onImportContentNavigate: vi.fn(),
  onModelDeletionModalOpen: vi.fn().mockResolvedValue(undefined),
  onModelUpdateModalOpen: vi.fn().mockResolvedValue(undefined),
  onModelExport: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const openDropdown = async () => {
  await user.click(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownIcon));
  await screen.findByTestId(DATA_TEST_ID.ModelCardUtilDropdownEdit);
};

const openSubmenu = async (testId: DATA_TEST_ID) => {
  const submenu = screen.getByTestId(testId);
  const trigger = within(submenu).getByRole("menuitem");
  await user.hover(trigger);
};

describe("Test ModelCard component", () => {
  test("Renders model details and utility menu", async () => {
    render(<ModelCard {...buildProps()} />);

    expect(screen.getByText("test model")).toBeInTheDocument();
    expect(screen.getByText("test description")).toBeInTheDocument();

    await openDropdown();

    expect(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownEdit)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownImport)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownExport)).toBeInTheDocument();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownDelete)).toBeInTheDocument();
  });

  test("Fires menu actions when enabled", async () => {
    const props = buildProps();
    render(<ModelCard {...props} />);

    await openDropdown();
    await user.click(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownEdit));

    expect(props.onModelUpdateModalOpen).toHaveBeenCalledWith(props.model);

    await openDropdown();
    await user.click(screen.getByTestId(DATA_TEST_ID.ModelCardUtilDropdownDelete));

    expect(props.onModelDeletionModalOpen).toHaveBeenCalledWith(props.model);

    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCardUtilDropdownExport);
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.ModelCardUtilDropdownExportContentJSON),
    );

    expect(props.onModelExport).toHaveBeenCalledWith(props.model.id, ExportFormat.Json);
  });

  test("Toggles import options based on schema fields", async () => {
    const baseProps = buildProps();
    const withFields = buildProps({
      model: {
        ...baseProps.model,
        schema: {
          id: "test-schema-id",
          fields: [
            {
              id: "field-1",
              type: SchemaFieldType.Text,
              title: "Title",
              key: "title",
              description: "",
              required: false,
              unique: false,
              multiple: false,
              isTitle: false,
            },
          ],
        },
      },
    });

    render(<ModelCard {...withFields} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCardUtilDropdownImport);

    const importSchema = await screen.findByTestId(DATA_TEST_ID.ModelCardUtilDropdownImportSchema);
    const importContent = await screen.findByTestId(
      DATA_TEST_ID.ModelCardUtilDropdownImportContent,
    );

    expect(importSchema).toHaveClass("ant-dropdown-menu-item-disabled");
    expect(importContent).not.toHaveClass("ant-dropdown-menu-item-disabled");
  });

  test("Disables import content when schema is empty", async () => {
    render(<ModelCard {...buildProps()} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCardUtilDropdownImport);

    const importSchema = await screen.findByTestId(DATA_TEST_ID.ModelCardUtilDropdownImportSchema);
    const importContent = await screen.findByTestId(
      DATA_TEST_ID.ModelCardUtilDropdownImportContent,
    );

    expect(importSchema).not.toHaveClass("ant-dropdown-menu-item-disabled");
    expect(importContent).toHaveClass("ant-dropdown-menu-item-disabled");
  });
});
