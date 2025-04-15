import { AndConditionInput } from "@reearth-cms/components/molecules/View/types";
import { AndCondition as GQLAndCondition } from "@reearth-cms/gql/graphql-client-api";

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

export function filterConvert(filter: GQLAndCondition): AndConditionInput | undefined {
  if (!filter || filter?.conditions?.length === 0) return;

  const convertedFilter: {
    conditions: Record<
      string,
      {
        fieldId: { id: string; type: string };
        operator: string;
        value: string;
      }
    >[];
  } = { conditions: [] };
  let key;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        fieldId: { id: c.fieldId.id as string, type: c.fieldId.type },
        operator: c[key + "Operator"],
        value: c[key + "Value"],
      },
    });
  }
  return convertedFilter;
}
