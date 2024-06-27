import { Trans } from "react-i18next";

import type { FieldType } from "./types";

export const fieldTypes: {
  [key in FieldType]: {
    icon: string;
    title: string;
    description: React.ReactElement;
    color: string;
  };
} = {
  Text: {
    icon: "textT",
    title: "Text",
    description: <Trans i18nKey="Heading and titles, one-line field" />,
    color: "#FF7875",
  },
  TextArea: {
    icon: "textAlignLeft",
    title: "TextArea",
    description: <Trans i18nKey="Multi line text" />,
    color: "#FF7875",
  },
  MarkdownText: {
    icon: "markdown",
    title: "Markdown text",
    description: <Trans i18nKey="Rich text which supports md style" />,
    color: "#FF7875",
  },
  Asset: {
    icon: "asset",
    title: "Asset",
    description: <Trans i18nKey="Asset file" />,
    color: "#FF9C6E",
  },
  Bool: {
    icon: "boolean",
    title: "Boolean",
    description: <Trans i18nKey="true/false field" />,
    color: "#FFD666",
  },
  Select: {
    icon: "listBullets",
    title: "Option",
    description: <Trans i18nKey="Multiple select" />,
    color: "#7CB305",
  },
  Integer: {
    icon: "numberNine",
    title: "Int",
    description: <Trans i18nKey="Integer" />,
    color: "#36CFC9",
  },
  URL: {
    icon: "link",
    title: "URL",
    description: <Trans i18nKey="http/https URL" />,
    color: "#9254DE",
  },
  Reference: {
    icon: "arrowUpRight",
    title: "Reference",
    description: <Trans i18nKey="Reference other models and items" />,
    color: "#597EF7",
  },
  Date: {
    icon: "date",
    title: "Date",
    description: <Trans i18nKey="Date picker" />,
    color: "#FFC069",
  },
  Tag: {
    icon: "tag",
    title: "Tag",
    description: <Trans i18nKey="Select from a list of tags" />,
    color: "#7CB305",
  },
  Checkbox: {
    icon: "checkSquare",
    title: "Check Box",
    description: <Trans i18nKey="Select from a list of checkboxes" />,
    color: "#FFC069",
  },
  Group: {
    icon: "group",
    title: "Group",
    description: <Trans i18nKey="Customize a group of fields" />,
    color: "#36CFC9",
  },
};

// t("Text");
// t("TextArea");
// t("Markdown text");
// t("Asset");
// t("Boolean");
// t("Option");
// t("Int");
// t("URL");
// t("Date");
// t("Reference");
// t("Tag");
// t("Check Box");
// t("Group");
