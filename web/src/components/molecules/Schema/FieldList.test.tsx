import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";

import { Test } from "@reearth-cms/test/utils";

import FieldList from "./FieldList";
import { SchemaFieldType } from "./types";


const defaultProps = {
  currentTab: "fields" as const,
  selectedSchemaType: "model" as const,
  hasCreateRight: true,
  addField: vi.fn(),
};

describe("FieldList", () => {
  const user = userEvent.setup();

  test("renders 'Add Field' title", () => {
    render(<FieldList {...defaultProps} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Add Field");
  });

  test("renders model field items for model + fields tab", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="model" currentTab="fields" />,
    );
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Text")),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Reference")),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Group")),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("GeometryObject")),
    ).toBeInTheDocument();
  });

  test("does not render Reference/Group for model + meta-data tab", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="model" currentTab="meta-data" />,
    );
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Tag")),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Checkbox")),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(Test.getDataTestIdFromSchemaFieldType("Reference")),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(Test.getDataTestIdFromSchemaFieldType("Group")),
    ).not.toBeInTheDocument();
  });

  test("renders group field items without Reference/Group for group type", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="group" currentTab="fields" />,
    );
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Text")),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("GeometryObject")),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(Test.getDataTestIdFromSchemaFieldType("Reference")),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(Test.getDataTestIdFromSchemaFieldType("Group")),
    ).not.toBeInTheDocument();
  });

  test("renders correct data-testid for each model field type", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="model" currentTab="fields" />,
    );
    const modelFieldTypes: SchemaFieldType[] = [
      "Text",
      "TextArea",
      "MarkdownText",
      "Asset",
      "Date",
      "Bool",
      "Select",
      "Integer",
      "Number",
      "URL",
      "Reference",
      "Group",
      "GeometryObject",
      "GeometryEditor",
    ];
    for (const fieldType of modelFieldTypes) {
      expect(
        screen.getByTestId(Test.getDataTestIdFromSchemaFieldType(fieldType)),
      ).toBeInTheDocument();
    }
  });

  test("renders correct data-testid for each meta-data field type", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="model" currentTab="meta-data" />,
    );
    const metaFieldTypes: SchemaFieldType[] = ["Tag", "Bool", "Checkbox", "Date", "Text", "URL"];
    for (const fieldType of metaFieldTypes) {
      expect(
        screen.getByTestId(Test.getDataTestIdFromSchemaFieldType(fieldType)),
      ).toBeInTheDocument();
    }
  });

  test("calls addField with correct type when item is clicked", async () => {
    const addField = vi.fn();
    render(<FieldList {...defaultProps} addField={addField} />);
    const textItem = screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Text"));
    await user.click(textItem);
    expect(addField).toHaveBeenCalledWith("Text");
  });

  test("does not call addField when hasCreateRight is false", async () => {
    const addField = vi.fn();
    render(<FieldList {...defaultProps} addField={addField} hasCreateRight={false} />);
    const textItem = screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("Text"));
    await user.click(textItem);
    expect(addField).not.toHaveBeenCalled();
  });

  test("renders category titles for model fields", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="model" currentTab="fields" />,
    );
    const headings = screen.getAllByRole("heading", { level: 2 });
    const titles = headings.map(h => h.textContent);
    expect(titles).toContain("Text");
    expect(titles).toContain("Asset");
    expect(titles).toContain("Time");
    expect(titles).toContain("Boolean");
    expect(titles).toContain("Select");
    expect(titles).toContain("Number");
    expect(titles).toContain("URL");
    expect(titles).toContain("Relation");
    expect(titles).toContain("Group");
    expect(titles).toContain("GeoJSON Geometry");
  });

  test("renders Meta Data category title for meta-data tab", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="model" currentTab="meta-data" />,
    );
    const headings = screen.getAllByRole("heading", { level: 2 });
    const titles = headings.map(h => h.textContent);
    expect(titles).toContain("Meta Data");
  });

  test("group type ignores currentTab and always shows group data source", () => {
    render(
      <FieldList {...defaultProps} selectedSchemaType="group" currentTab="meta-data" />,
    );
    expect(
      screen.getByTestId(Test.getDataTestIdFromSchemaFieldType("GeometryObject")),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(Test.getDataTestIdFromSchemaFieldType("Reference")),
    ).not.toBeInTheDocument();
  });
});
