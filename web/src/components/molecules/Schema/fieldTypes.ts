import type { IconName } from "@reearth-cms/components/atoms/Icon";
import { t } from "@reearth-cms/i18n";
import { AntdColor } from "@reearth-cms/utils/style";

import type { SchemaFieldType } from "./types";

export const fieldTypes: Record<
  SchemaFieldType,
  {
    icon: IconName;
    title: string;
    description: string;
    color: string;
  }
> = {
  Text: {
    icon: "textT",
    title: t("Text"),
    description: t("Heading and titles, one-line field"),
    color: AntdColor.RED.RED_3,
  },
  TextArea: {
    icon: "textAlignLeft",
    title: t("TextArea"),
    description: t("Multi line text"),
    color: AntdColor.RED.RED_3,
  },
  MarkdownText: {
    icon: "markdown",
    title: t("Markdown text"),
    description: t("Rich text which supports md style"),
    color: AntdColor.RED.RED_3,
  },
  Asset: {
    icon: "asset",
    title: t("Asset"),
    description: t("Asset file"),
    color: AntdColor.VOLCANO.VOLCANO_3,
  },
  Bool: {
    icon: "boolean",
    title: t("Boolean"),
    description: t("true/false field"),
    color: AntdColor.GOLD.GOLD_3,
  },
  Select: {
    icon: "listBullets",
    title: t("Option"),
    description: t("Multiple select"),
    color: AntdColor.LIME.LIME_6,
  },
  Integer: {
    icon: "numberNine",
    title: t("Int"),
    description: t("Integer"),
    color: AntdColor.CYAN.CYAN_4,
  },
  Number: {
    icon: "infinity",
    title: t("Float"),
    description: t("Fractional"),
    color: AntdColor.CYAN.CYAN_4,
  },
  URL: {
    icon: "link",
    title: t("URL"),
    description: "http/https URL",
    color: AntdColor.PURPLE.PURPLE_4,
  },
  Reference: {
    icon: "arrowUpRight",
    title: t("Reference"),
    description: t("Reference other models and items"),
    color: AntdColor.GEEKBLUE.GEEKBLUE_4,
  },
  Date: {
    icon: "date",
    title: t("Date"),
    description: t("Date picker"),
    color: AntdColor.ORANGE.ORANGE_3,
  },
  Tag: {
    icon: "tag",
    title: t("Tag"),
    description: t("Select from a list of tags"),
    color: AntdColor.LIME.LIME_6,
  },
  Checkbox: {
    icon: "checkSquare",
    title: t("Check Box"),
    description: t("Select from a list of checkboxes"),
    color: AntdColor.ORANGE.ORANGE_3,
  },
  Group: {
    icon: "group",
    title: t("Group"),
    description: t("Customize a group of fields"),
    color: AntdColor.CYAN.CYAN_4,
  },
  GeometryObject: {
    icon: "curlyBrackets",
    title: t("Geometry Object"),
    description: t("Input GeoJSON and preview"),
    color: AntdColor.GREEN.GREEN_4,
  },
  GeometryEditor: {
    icon: "pencil",
    title: t("Geometry Editor"),
    description: t("Draw the geometry on map"),
    color: AntdColor.GREEN.GREEN_4,
  },
};
