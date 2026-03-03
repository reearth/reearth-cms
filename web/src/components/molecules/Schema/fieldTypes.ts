import { t } from "@reearth-cms/i18n";

import type { SchemaFieldType } from "./types";

export const fieldTypes: Record<
  SchemaFieldType,
  {
    color: string;
    description: string;
    icon: string;
    title: string;
  }
> = {
  Asset: {
    color: "#FF9C6E",
    description: t("Asset file"),
    icon: "asset",
    title: t("Asset"),
  },
  Bool: {
    color: "#FFD666",
    description: t("true/false field"),
    icon: "boolean",
    title: t("Boolean"),
  },
  Checkbox: {
    color: "#FFC069",
    description: t("Select from a list of checkboxes"),
    icon: "checkSquare",
    title: t("Check Box"),
  },
  Date: {
    color: "#FFC069",
    description: t("Date picker"),
    icon: "date",
    title: t("Date"),
  },
  GeometryEditor: {
    color: "#73D13D",
    description: t("Draw the geometry on map"),
    icon: "pencil",
    title: t("Geometry Editor"),
  },
  GeometryObject: {
    color: "#73D13D",
    description: t("Input GeoJSON and preview"),
    icon: "curlyBrackets",
    title: t("Geometry Object"),
  },
  Group: {
    color: "#36CFC9",
    description: t("Customize a group of fields"),
    icon: "group",
    title: t("Group"),
  },
  Integer: {
    color: "#36CFC9",
    description: t("Integer"),
    icon: "numberNine",
    title: t("Int"),
  },
  MarkdownText: {
    color: "#FF7875",
    description: t("Rich text which supports md style"),
    icon: "markdown",
    title: t("Markdown text"),
  },
  Number: {
    color: "#36CFC9",
    description: t("Fractional"),
    icon: "infinity",
    title: t("Float"),
  },
  Reference: {
    color: "#597EF7",
    description: t("Reference other models and items"),
    icon: "arrowUpRight",
    title: t("Reference"),
  },
  Select: {
    color: "#7CB305",
    description: t("Multiple select"),
    icon: "listBullets",
    title: t("Option"),
  },
  Tag: {
    color: "#7CB305",
    description: t("Select from a list of tags"),
    icon: "tag",
    title: t("Tag"),
  },
  Text: {
    color: "#FF7875",
    description: t("Heading and titles, one-line field"),
    icon: "textT",
    title: t("Text"),
  },
  TextArea: {
    color: "#FF7875",
    description: t("Multi line text"),
    icon: "textAlignLeft",
    title: t("TextArea"),
  },
  URL: {
    color: "#9254DE",
    description: "http/https URL",
    icon: "link",
    title: t("URL"),
  },
};
