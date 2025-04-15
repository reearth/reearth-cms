import { t } from "@reearth-cms/i18n";

import type { FieldType } from "./types";

export const fieldTypes: {
  [key in FieldType]: {
    icon: string;
    title: string;
    description: string;
    color: string;
  };
} = {
  Text: {
    icon: "textT",
    title: "Text",
    description: "Heading and titles, one-line field",
    color: "#FF7875",
  },
  TextArea: {
    icon: "textAlignLeft",
    title: "TextArea",
    description: "Multi line text",
    color: "#FF7875",
  },
  MarkdownText: {
    icon: "markdown",
    title: "Markdown text",
    description: "Rich text which supports md style",
    color: "#FF7875",
  },
  Asset: {
    icon: "asset",
    title: "Asset",
    description: "Asset file",
    color: "#FF9C6E",
  },
  Bool: {
    icon: "boolean",
    title: "Boolean",
    description: "true/false field",
    color: "#FFD666",
  },
  Select: {
    icon: "listBullets",
    title: "Option",
    description: "Multiple select",
    color: "#7CB305",
  },
  Integer: {
    icon: "numberNine",
    title: "Int",
    description: "Integer",
    color: "#36CFC9",
  },
  Number: {
    icon: "infinity",
    title: "Float",
    description: "Fractional",
    color: "#36CFC9",
  },
  URL: {
    icon: "link",
    title: "URL",
    description: "http/https URL",
    color: "#9254DE",
  },
  Reference: {
    icon: "arrowUpRight",
    title: "Reference",
    description: "Reference other models and items",
    color: "#597EF7",
  },
  Date: {
    icon: "date",
    title: "Date",
    description: "Date picker",
    color: "#FFC069",
  },
  Tag: {
    icon: "tag",
    title: "Tag",
    description: "Select from a list of tags",
    color: "#7CB305",
  },
  Checkbox: {
    icon: "checkSquare",
    title: "Check Box",
    description: "Select from a list of checkboxes",
    color: "#FFC069",
  },
  Group: {
    icon: "group",
    title: "Group",
    description: "Customize a group of fields",
    color: "#36CFC9",
  },
  GeometryObject: {
    icon: "curlyBrackets",
    title: "Geometry Object",
    description: "Input GeoJSON and preview",
    color: "#73D13D",
  },
  GeometryEditor: {
    icon: "pencil",
    title: "Geometry Editor",
    description: "Draw the geometry on map",
    color: "#73D13D",
  },
};

t("Text");
t("Heading and titles, one-line field");

t("TextArea");
t("Multi line text");

t("Markdown text");
t("Rich text which supports md style");

t("Asset");
t("Asset file");

t("Boolean");
t("true/false field");

t("Option");
t("Multiple select");

t("Int");
t("Integer");

t("Float");
t("Fractional");

t("URL");
t("http/https URL");

t("Reference");
t("Reference other models and items");

t("Date");
t("Date picker");

t("Tag");
t("Select from a list of tags");

t("Check Box");
t("Select from a list of checkboxes");

t("Group");
t("Customize a group of fields");

t("Geometry Object");
t("Input GeoJSON and preview");

t("Geometry Editor");
t("Draw the geometry on map");
