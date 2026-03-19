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
  hasSchemaCreateRight: true,
  hasContentCreateRight: true,
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

const buildModelWithFields = (fields: { id: string; type: SchemaFieldType }[]): Props["model"] => ({
  ...buildProps().model,
  schema: {
    id: "test-schema-id",
    fields: fields.map(f => ({
      id: f.id,
      type: f.type,
      title: f.id,
      key: f.id,
      description: "",
      required: false,
      unique: false,
      multiple: false,
      isTitle: false,
    })),
  },
});

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

  test("Schema icon calls onSchemaNavigate", async () => {
    const props = buildProps();
    render(<ModelCard {...props} />);
    await user.click(screen.getByRole("img", { name: "unordered-list" }));
    expect(props.onSchemaNavigate).toHaveBeenCalledWith("test-id");
  });

  test("Content icon calls onContentNavigate", async () => {
    const props = buildProps();
    render(<ModelCard {...props} />);
    await user.click(screen.getByRole("img", { name: "table" }));
    expect(props.onContentNavigate).toHaveBeenCalledWith("test-id");
  });

  test("Edit disabled when hasUpdateRight is false", async () => {
    render(<ModelCard {...buildProps({ hasUpdateRight: false })} />);
    await openDropdown();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownEdit)).toHaveClass(
      "ant-dropdown-menu-item-disabled",
    );
  });

  test("Delete disabled when hasDeleteRight is false", async () => {
    render(<ModelCard {...buildProps({ hasDeleteRight: false })} />);
    await openDropdown();
    expect(screen.getByTestId(DATA_TEST_ID.ModelCard__UtilDropdownDelete)).toHaveClass(
      "ant-dropdown-menu-item-disabled",
    );
  });

  test("Export schema calls onModelExport with Schema format", async () => {
    const props = buildProps();
    render(<ModelCard {...props} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownExport);
    await user.click(await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportSchema));
    expect(props.onModelExport).toHaveBeenCalledWith("test-id", ExportFormat.Schema);
  });

  test("CSV export shows confirmation modal", async () => {
    render(<ModelCard {...buildProps()} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownExport);
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentCSV),
    );
    expect(await screen.findByRole("button", { name: "Export CSV" })).toBeVisible();
  });

  test("GeoJSON export with 0 geometry fields shows error", async () => {
    render(<ModelCard {...buildProps()} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownExport);
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON),
    );
    expect(await screen.findByText("Cannot export GeoJSON")).toBeInTheDocument();
  });

  test("GeoJSON export with 1 geometry field exports directly", async () => {
    const model = buildModelWithFields([{ id: "geo1", type: SchemaFieldType.GeometryEditor }]);
    const props = buildProps({ model });
    render(<ModelCard {...props} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownExport);
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON),
    );
    expect(props.onModelExport).toHaveBeenCalledWith("test-id", ExportFormat.Geojson);
  });

  test("GeoJSON export with multiple geometry fields shows warning", async () => {
    const model = buildModelWithFields([
      { id: "geo1", type: SchemaFieldType.GeometryEditor },
      { id: "geo2", type: SchemaFieldType.GeometryObject },
    ]);
    render(<ModelCard {...buildProps({ model })} />);
    await openDropdown();
    await openSubmenu(DATA_TEST_ID.ModelCard__UtilDropdownExport);
    await user.click(
      await screen.findByTestId(DATA_TEST_ID.ModelCard__UtilDropdownExportContentGeoJSON),
    );
    expect(await screen.findByText("Multiple Geometry fields detected")).toBeInTheDocument();
  });
});
