import { t } from "@reearth-cms/i18n";

import type { SchemaFieldType } from "./types";

export const fieldTypes: Record<
  SchemaFieldType,
  {
    icon: string;
    title: string;
    description: string;
    color: string;
  }
> = {
  Text: {
    icon: "textT",
    title: t("Text"),
    description: t("Heading and titles, one-line field"),
    color: "#FF7875",
  },
  TextArea: {
    icon: "textAlignLeft",
    title: t("TextArea"),
    description: t("Multi line text"),
    color: "#FF7875",
  },
  MarkdownText: {
    icon: "markdown",
    title: t("Markdown text"),
    description: t("Rich text which supports md style"),
    color: "#FF7875",
  },
  Asset: {
    icon: "asset",
    title: t("Asset"),
    description: t("Asset file"),
    color: "#FF9C6E",
  },
  Bool: {
    icon: "boolean",
    title: t("Boolean"),
    description: t("true/false field"),
    color: "#FFD666",
  },
  Select: {
    icon: "listBullets",
    title: t("Option"),
    description: t("Multiple select"),
    color: "#7CB305",
  },
  Integer: {
    icon: "numberNine",
    title: t("Int"),
    description: t("Integer"),
    color: "#36CFC9",
  },
  Number: {
    icon: "infinity",
    title: t("Float"),
    description: t("Fractional"),
    color: "#36CFC9",
  },
  URL: {
    icon: "link",
    title: t("URL"),
    description: "http/https URL",
    color: "#9254DE",
  },
  Reference: {
    icon: "arrowUpRight",
    title: t("Reference"),
    description: t("Reference other models and items"),
    color: "#597EF7",
  },
  Date: {
    icon: "date",
    title: t("Date"),
    description: t("Date picker"),
    color: "#FFC069",
  },
  Tag: {
    icon: "tag",
    title: t("Tag"),
    description: t("Select from a list of tags"),
    color: "#7CB305",
  },
  Checkbox: {
    icon: "checkSquare",
    title: t("Check Box"),
    description: t("Select from a list of checkboxes"),
    color: "#FFC069",
  },
  Group: {
    icon: "group",
    title: t("Group"),
    description: t("Customize a group of fields"),
    color: "#36CFC9",
  },
  GeometryObject: {
    icon: "curlyBrackets",
    title: t("Geometry Object"),
    description: t("Input GeoJSON and preview"),
    color: "#73D13D",
  },
  GeometryEditor: {
    icon: "pencil",
    title: t("Geometry Editor"),
    description: t("Draw the geometry on map"),
    color: "#73D13D",
  },
};
