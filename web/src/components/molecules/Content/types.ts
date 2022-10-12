import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemField = {
  schemaFieldID: string;
  type: FieldType;
  value: any;
};

export type Item = {
  id: string;
  schemaID: string;
  fields: ItemField[] | undefined | null;
};

export type ContentTableField = {
  id: string;
  schemaID: string;
  fields: { [key: string]: any };
};
