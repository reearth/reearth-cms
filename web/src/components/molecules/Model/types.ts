import { Schema, MetaDataSchema } from "@reearth-cms/components/molecules/Schema/types";

export interface Model {
  id: string;
  name: string;
  description: string;
  key: string;
  schemaId: string;
  schema: Schema;
  metadataSchema: MetaDataSchema;
  public: boolean;
  order?: number;
}
