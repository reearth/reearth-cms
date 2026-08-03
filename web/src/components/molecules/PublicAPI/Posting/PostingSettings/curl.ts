import type { Field, SchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";

// Field types the public posting API silently drops (and rejects when required).
// Keep in sync with the server's `unsupportedTypes`
// (server/internal/adapter/publicapi/item.go:22-29).
export const UNSUPPORTED_POSTING_FIELD_TYPES: ReadonlySet<SchemaFieldType> = new Set<SchemaFieldType>(
  ["Asset", "Reference", "Tag", "Group", "GeometryObject", "GeometryEditor"],
);

// The server caps URL fields at 2048 chars regardless of the schema.
const URL_MAX_LENGTH = 2048;

const buildFieldHint = (field: Field): string => {
  const parts: string[] = [field.type];
  if (field.required) parts.push("required");

  const tp = field.typeProperty;
  switch (field.type) {
    case "Text":
    case "TextArea":
    case "MarkdownText":
      if (tp?.maxLength != null) parts.push(`maxLength: ${tp.maxLength}`);
      break;
    case "URL":
      parts.push(`maxLength: ${tp?.maxLength ?? URL_MAX_LENGTH}`);
      break;
    case "Select":
      if (tp?.values?.length) parts.push(`options: ${tp.values.join(" | ")}`);
      break;
    case "Integer":
      if (tp?.min != null) parts.push(`min: ${tp.min}`);
      if (tp?.max != null) parts.push(`max: ${tp.max}`);
      break;
    case "Number":
      if (tp?.numberMin != null) parts.push(`min: ${tp.numberMin}`);
      if (tp?.numberMax != null) parts.push(`max: ${tp.numberMax}`);
      break;
  }

  return `<${parts.join(", ")}>`;
};

export const buildFieldPlaceholder = (field: Field): string | string[] => {
  const hint = buildFieldHint(field);
  return field.multiple ? [hint] : hint;
};

export const buildPostItemCurl = (endpoint: string, fields: Field[]): string => {
  const body = {
    fields: fields
      .filter(field => !UNSUPPORTED_POSTING_FIELD_TYPES.has(field.type))
      .reduce<Record<string, string | string[]>>((acc, field) => {
        acc[field.key] = buildFieldPlaceholder(field);
        return acc;
      }, {}),
  };

  return [
    `curl -X POST '${endpoint}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '${JSON.stringify(body, null, 2)}'`,
  ].join("\n");
};
