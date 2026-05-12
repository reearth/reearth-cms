import { Schema, MetaDataSchema } from "@reearth-cms/components/molecules/Schema/types";

export type Model = {
  id: string;
  name: string;
  description: string;
  key: string;
  schemaId: string;
  schema: Schema;
  metadataSchema: MetaDataSchema;
  order?: number;
};

export enum ExportFormat {
  Csv = "CSV",
  Geojson = "GEOJSON",
  Json = "JSON",
  Schema = "SCHEMA",
}
