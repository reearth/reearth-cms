import { MetaDataSchema, Schema } from "@reearth-cms/components/molecules/Schema/types";

export type Model = {
  description: string;
  id: string;
  key: string;
  metadataSchema: MetaDataSchema;
  name: string;
  order?: number;
  schema: Schema;
  schemaId: string;
};

export enum ExportFormat {
  Csv = "CSV",
  Geojson = "GEOJSON",
  Json = "JSON",
  Schema = "SCHEMA",
}
