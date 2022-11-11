export const fieldTypes: {
  [P: string]: { icon: string; title: string; description: string; color: string };
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
  URL: {
    icon: "link",
    title: "URL",
    description: "http/https URL",
    color: "#9254DE",
  },
};
