/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { getIssues, HintIssue } from "@placemarkio/check-geojson";
import type { GeoJSON } from "geojson";
import Papa from "papaparse";
import { z, ZodCoercedNumber, ZodNumber, ZodString } from "zod";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import { ObjectUtils } from "@reearth-cms/utils/object";

import { Constant } from "./constant";

interface FieldBase {
  title: string;
  description?: string;
}

interface FieldTextBase extends FieldBase {
  type: "string";
  maxLength?: number;
}

interface FieldNumberBase extends FieldBase {
  maximum?: number;
  minimum?: number;
}

interface FieldAsset extends FieldBase {
  type: "string";
  format: "binary";
}

interface FieldBoolean extends FieldBase {
  type: "boolean";
}

interface FieldDateTime extends FieldBase {
  type: "string";
  format: "date-time";
}

interface FieldFloat extends FieldNumberBase {
  type: "number";
}

interface FieldGeoEditor extends FieldBase {
  type: "object";
}

interface FieldGeoObject extends FieldBase {
  type: "object";
}

interface FieldInt extends FieldNumberBase {
  type: "integer";
}

interface FieldOption extends FieldBase {
  type: "string";
}

interface FieldUrl extends FieldBase {
  type: "string";
  format: "uri";
}

type ImportSchemaField =
  | FieldTextBase
  | FieldFloat
  | FieldInt
  | FieldBoolean
  | FieldDateTime
  | FieldAsset
  | FieldOption
  | FieldUrl
  | FieldGeoEditor
  | FieldGeoObject;

interface ImportSchema {
  properties: Record<string, ImportSchemaField>;
}

type ContentSourceFormat = "CSV" | "JSON" | "GEOJSON";

export interface ImportContentJSON {
  results: Record<string, unknown>[];
  totalCount: number;
}

export abstract class ImportUtils {
  public static validateSchemaFromJSON(
    json: Record<string, unknown>,
  ): { isValid: true; data: ImportSchema } | { isValid: false; error: string } {
    const validation = this.IMPORT_SCHEMA_VALIDATOR.safeParse(json);

    if (validation.success) {
      return { isValid: true, data: validation.data };
    } else {
      return { isValid: false, error: validation.error.message };
    }
  }

  public static validateSchemaFromGeoJSON(
    json: Record<string, unknown>,
  ): { isValid: true; data: ImportSchema } | { isValid: false; error: string } {
    // TODO: implement THIS!!
    const validation = this.IMPORT_SCHEMA_VALIDATOR.safeParse(json);

    if (validation.success) {
      return { isValid: true, data: validation.data };
    } else {
      return { isValid: false, error: validation.error.message };
    }
  }

  public static validateContentFromCSV(
    csvString: string,
    targetSchema: Model,
  ): { isValid: true; data: unknown } | { isValid: false; error: string } {
    const csvObject = this.convertCSVToJSON(csvString);

    const fieldSchema = this.getDynamicFieldValidator(targetSchema.schema.fields, "CSV");
    const schemaValidation = fieldSchema
      .array()
      .max(Constant.IMPORT.MAX_CONTENT_RECORDS)
      .safeParse(csvObject);

    if (schemaValidation.success) {
      return { isValid: true, data: schemaValidation.data };
    } else {
      return { isValid: false, error: schemaValidation.error.message };
    }
  }

  public static validateContentFromJSON(
    importContent: ImportContentJSON,
    targetSchema: Model,
  ): { isValid: true; data: unknown } | { isValid: false; error: string } {
    const importContentValidation = this.IMPORT_CONTENT_JSON_VALIDATOR.safeParse(importContent);
    if (!importContentValidation.success)
      return { isValid: false, error: importContentValidation.error.message };

    const fieldSchema = this.getDynamicFieldValidator(targetSchema.schema.fields, "JSON");
    const schemaValidation = fieldSchema
      .array()
      .max(Constant.IMPORT.MAX_CONTENT_RECORDS)
      .safeParse(importContentValidation.data.results);

    if (schemaValidation.success) {
      return { isValid: true, data: schemaValidation.data };
    } else {
      return { isValid: false, error: schemaValidation.error.message };
    }
  }

  public static validateContentFromGeoJson(
    raw: Record<string, unknown> | string | GeoJSON,
    targetSchema: Model,
  ): { isValid: true; data: unknown } | { isValid: false; error: string } {
    const geoJsonValidation = ObjectUtils.validateGeoJson(raw);

    if (!geoJsonValidation.isValid)
      return { isValid: false, error: geoJsonValidation.errors.join(",") };

    if (geoJsonValidation.data.type !== "FeatureCollection")
      return { isValid: false, error: "not feature collection" };

    const fieldSchema = this.getDynamicFieldValidator(targetSchema.schema.fields, "GEOJSON");
    const test = geoJsonValidation.data.features.map(feature => feature.properties);
    const schemaValidation = fieldSchema
      .array()
      .max(Constant.IMPORT.MAX_CONTENT_RECORDS)
      .safeParse(test);

    if (schemaValidation.success) {
      return { isValid: true, data: schemaValidation.data };
    } else {
      return { isValid: false, error: schemaValidation.error.message };
    }
  }

  private static getDynamicFieldValidator(fieldData: Field[], sourceFormat: ContentSourceFormat) {
    const validateObj: Record<string, unknown> = {};

    fieldData.forEach(field => {
      switch (field.type) {
        case "Text":
        case "TextArea":
        case "MarkdownText": {
          let stringField: ZodString = z.string();
          if (field.typeProperty?.maxLength) {
            stringField = stringField.max(field.typeProperty.maxLength);
          }
          validateObj[field.key] = stringField;
          break;
        }
        case "Date":
          validateObj[field.key] = z.coerce.date();
          break;
        case "Bool":
          validateObj[field.key] = z.coerce.boolean();
          break;
        case "Integer": {
          let intField: ZodCoercedNumber<unknown> = z.coerce.number().int();
          if (field.typeProperty?.max) intField = intField.max(field.typeProperty.max);
          if (field.typeProperty?.min) intField = intField.min(field.typeProperty.min);

          validateObj[field.key] = intField;
          break;
        }
        case "Number": {
          let floatField: ZodNumber = z.coerce.number();
          if (field.typeProperty?.numberMax)
            floatField = floatField.max(field.typeProperty.numberMax);
          if (field.typeProperty?.min) floatField = floatField.min(field.typeProperty.min);

          validateObj[field.key] = floatField;
          break;
        }
        case "URL":
          validateObj[field.key] = z.url();
          break;
        case "GeometryObject": {
          // CSV file cannot contain geometry object
          if (sourceFormat === "JSON") {
            validateObj[field.key] = z.json().refine(
              val => {
                if (!val) return false;
                const issues: HintIssue[] = getIssues(JSON.stringify(val));
                return !(issues.length > 0);
              },
              { error: "Invalid GeometryObject format." },
            );
          }

          break;
        }
        default:
      }
    });

    return z.object(validateObj);
  }

  private static readonly FIELD_BASE_VALIDATOR: z.ZodSchema<FieldBase> = z.object({
    title: z.string(),
    description: z.string().optional(),
  });

  private static readonly IMPORT_SCHEMA_VALIDATOR: z.ZodSchema<ImportSchema> = z.object({
    properties: z.record(
      z.string(),
      z.union([
        z
          .object({
            type: z.literal("string"),
            format: z.literal("binary"),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("boolean"),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("string"),
            format: z.literal("date-time"),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("number"),
            maximum: z.number().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("object"),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("integer"),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("string"),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("string"),
            maxLength: z.int().nonnegative().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("string"),
            format: z.literal("uri"),
          })
          .and(this.FIELD_BASE_VALIDATOR),
      ]),
    ),
  });

  private static readonly IMPORT_CONTENT_JSON_VALIDATOR: z.ZodSchema<ImportContentJSON> = z.object({
    results: z.record(z.string(), z.unknown()).array().max(Constant.IMPORT.MAX_CONTENT_RECORDS),
    totalCount: z.int().nonnegative(),
  });

  public static convertCSVToJSON(csvString: string): unknown[] {
    const result = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    return result.data;
  }
}
