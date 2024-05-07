import { dateConvert } from "@reearth-cms/components/organisms/Project/Content/ContentDetails/utils";
import { ItemField } from "@reearth-cms/gql/graphql-client-api";

export const initialValuesGet = (fields?: ItemField[]): { [key: string]: any } => {
  const initialValues: { [key: string]: any } = {};
  fields?.forEach(field => {
    initialValues[field.schemaFieldId] =
      field.type === "Date" ? dateConvert(field.value) : field.value;
  });
  return initialValues;
};
