import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemField = {
  schemaFieldID: string;
  type: FieldType;
  value: string;
};

export type Item = {
  id: string;
  schemaID: string;
  fields: ItemField[] | undefined | null;
};
