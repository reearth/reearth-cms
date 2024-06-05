import { dateConvert } from "@reearth-cms/components/organisms/Project/Content/ContentDetails/utils";
import { ItemField } from "@reearth-cms/gql/graphql-client-api";

export const initialValuesGet = (fields?: ItemField[]): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  fields?.forEach(field => {
    if (field.itemGroupId) {
      initialValues[field.schemaFieldId] = {
        ...initialValues[field.schemaFieldId],
        ...{ [field.itemGroupId]: field.type === "Date" ? dateConvert(field.value) : field.value },
      };
    } else {
      initialValues[field.schemaFieldId] =
        field.type === "Date" ? dateConvert(field.value) : field.value;
    }
  });
  return initialValues;
};
