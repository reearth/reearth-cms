import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ExportFormat } from "@reearth-cms/components/molecules/Model/types";
import { SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import ModelCard, { Props } from "./ModelCard";

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

    expect(screen.getByText("test model")).toBeInTheDocument();
    expect(screen.getByText("test description")).toBeInTheDocument();

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
