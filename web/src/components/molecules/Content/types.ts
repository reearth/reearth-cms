import { FieldType } from "@reearth-cms/components/molecules/Schema/types";

export type ItemField = {
  schemaFieldId: string;
  type: FieldType;
  value: any;
};

export type Item = {
  id: string;
  schemaId: string;
  fields: ItemField[] | undefined | null;
};

export type ContentTableField = {
  id: string;
  schemaId: string;
  fields: { [key: string]: any };
};
