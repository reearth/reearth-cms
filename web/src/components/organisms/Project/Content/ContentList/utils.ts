import { AndCondition } from "@reearth-cms/gql/graphql-client-api";

export function fileName(url: string | undefined): string {
  if (!url) return "";
  let files: string[];
  try {
    files = new URL(url).pathname.split("/");
  } catch {
    files = url.split("/");
  }
  return files.length ? files[files.length - 1] : "";
}

export function filterConvert(filter: AndCondition) {
  const convertedFilter: { conditions: any[] } = { conditions: [] };
  let key;
  for (const c of filter.conditions as any) {
    switch (c.__typename) {
      case "NullableFieldCondition":
        key = "nullable";
        break;
      case "MultipleFieldCondition":
        key = "multiple";
        break;
      case "BoolFieldCondition":
        key = "bool";
        break;
      case "StringFieldCondition":
        key = "string";
        break;
      case "NumberFieldCondition":
        key = "number";
        break;
      case "TimeFieldCondition":
        key = "time";
        break;
      default:
        key = "basic";
    }
    convertedFilter.conditions.push({
      [key]: {
        fieldId: { id: c.fieldId.id, type: c.fieldId.type },
        operator: c[key + "Operator"],
        value: c[key + "Value"],
      },
    });
  }
  return convertedFilter;
}
