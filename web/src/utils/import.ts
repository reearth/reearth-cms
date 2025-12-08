/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { getIssues, HintIssue } from "@placemarkio/check-geojson";
import type { GeoJSON } from "geojson";
import Papa, { ParseResult } from "papaparse";
import { z, ZodCoercedNumber, ZodNumber, ZodString } from "zod";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { PerformanceTimer } from "@reearth-cms/utils/performance";

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

export interface ErrorMeta {
  exceedLimit: boolean;
  mismatchFields: Set<PropertyKey>;
  modelFieldCount: number;
}

export interface ImportContentJSON {
  results: Record<string, unknown>[];
  totalCount: number;
}

export abstract class ImportUtils {
  public static validateSchemaFromJSON(
    json: Record<string, unknown>,
  ): { isValid: true; data: ImportSchema } | { isValid: false; error: string } {
    const timer = new PerformanceTimer("validateSchemaFromJSON");

    const validation = this.IMPORT_SCHEMA_VALIDATOR.safeParse(json);

    timer.log();

    if (validation.success) {
      return { isValid: true, data: validation.data };
    } else {
      return { isValid: false, error: validation.error.message };
    }
  }

  public static async validateContentFromCSV<T = unknown>(
    csvList: T[],
    modelFields: Model["schema"]["fields"],
    maxRecordLimit = Constant.IMPORT.MAX_CONTENT_RECORDS,
  ): Promise<
    { isValid: true; data: Record<string, unknown>[] } | { isValid: false; error: ErrorMeta }
  > {
    const timer = new PerformanceTimer("validateContentFromCSV");

    try {
      const { validator, acceptImportFieldCount } = this.getValidatorMeta(modelFields, "CSV");

      const validation = validator.array().max(maxRecordLimit).safeParse(csvList);

      if (validation.success) {
        return { isValid: true, data: validation.data };
      } else {
        return {
          isValid: false,
          error: this.getErrorMeta(validation, acceptImportFieldCount),
        };
      }
    } catch (error) {
      throw Error(String(error));
    } finally {
      timer.log();
    }
  }

  public static async validateContentFromJSON(
    importContent: ImportContentJSON,
    modelFields: Model["schema"]["fields"],
    maxRecordLimit = Constant.IMPORT.MAX_CONTENT_RECORDS,
  ): Promise<
    { isValid: true; data: ImportContentJSON["results"] } | { isValid: false; error: ErrorMeta }
  > {
    return new Promise<
      { isValid: true; data: ImportContentJSON["results"] } | { isValid: false; error: ErrorMeta }
    >((resolve, _reject) => {
      const timer = new PerformanceTimer("validateContentFromJSON");

      const { validator, acceptImportFieldCount } = this.getValidatorMeta(modelFields, "JSON");

      const validation = validator.array().max(maxRecordLimit).safeParse(importContent.results);

      if (validation.success) {
        resolve({ isValid: true, data: validation.data });
      } else {
        resolve({
          isValid: false,
          error: this.getErrorMeta(validation, acceptImportFieldCount),
        });
      }
      timer.log();
    });
  }

  public static async validateContentFromGeoJson(
    raw: GeoJSON,
    modelFields: Model["schema"]["fields"],
    maxRecordLimit = Constant.IMPORT.MAX_CONTENT_RECORDS,
  ): Promise<
    { isValid: true; data: Record<string, unknown>[] } | { isValid: false; error: ErrorMeta }
  > {
    return new Promise<
      { isValid: true; data: Record<string, unknown>[] } | { isValid: false; error: ErrorMeta }
    >((resolve, reject) => {
      const timer = new PerformanceTimer("validateContentFromGeoJson");

      if (raw.type !== "FeatureCollection") return void reject("Not feature collection");

      const { validator, acceptImportFieldCount } = this.getValidatorMeta(modelFields, "GEOJSON");
      const properties = raw.features.map(feature => feature.properties);

      const validation = validator.array().max(maxRecordLimit).safeParse(properties);

      if (validation.success) {
        resolve({ isValid: true, data: validation.data });
      } else {
        resolve({
          isValid: false,
          error: this.getErrorMeta(validation, acceptImportFieldCount),
        });
      }

      timer.log();
    });
  }

  private static getValidatorMeta(
    fieldData: Model["schema"]["fields"],
    sourceFormat: ContentSourceFormat,
  ) {
    const validateObj: Record<string, unknown> = {};
    let acceptImportFieldCount = 0;

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
          acceptImportFieldCount++;

          break;
        }
        case "Date":
          validateObj[field.key] = z.coerce.date();
          acceptImportFieldCount++;

          break;

        case "Bool":
          validateObj[field.key] = z.boolean();
          acceptImportFieldCount++;

          break;

        case "Integer": {
          let intField: ZodCoercedNumber<unknown> = z.coerce.number().int();
          if (field.typeProperty?.max) intField = intField.max(field.typeProperty.max);
          if (field.typeProperty?.min) intField = intField.min(field.typeProperty.min);

          validateObj[field.key] = intField;
          acceptImportFieldCount++;

          break;
        }

        case "Number":
          {
            let floatField: ZodNumber = z.coerce.number();
            if (field.typeProperty?.numberMax)
              floatField = floatField.max(field.typeProperty.numberMax);
            if (field.typeProperty?.min) floatField = floatField.min(field.typeProperty.min);

            validateObj[field.key] = floatField;
            acceptImportFieldCount++;
          }

          break;

        case "Select": {
          if (field.typeProperty?.values) {
            validateObj[field.key] = z.union(
              field.typeProperty.values.map(value => z.literal(value)),
            );
            acceptImportFieldCount++;
          }

          break;
        }

        case "URL":
          validateObj[field.key] = z.url();
          acceptImportFieldCount++;

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
            acceptImportFieldCount++;
          }

          break;
        }
        default:
      }
    });

    return { validator: z.object(validateObj), acceptImportFieldCount };
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

  private static getErrorMeta(
    schemaValidation: z.ZodSafeParseError<Record<string, unknown>[]>,
    modelFieldCount: number,
  ): ErrorMeta {
    return schemaValidation.error.issues.reduce<ErrorMeta>(
      (acc, curr, _index, _arr) => {
        if (curr.code === "too_big") return { ...acc, exceedLimit: true };
        if ((curr.code === "invalid_type" || curr.code === "invalid_union") && curr.path[1])
          return { ...acc, mismatchFields: acc.mismatchFields.add(curr.path[1]) };
        return acc;
      },
      { exceedLimit: false, mismatchFields: new Set<PropertyKey>(), modelFieldCount },
    );
  }

  public static convertCSVToJSON<T = unknown>(
    csvString: string,
  ): Promise<{ isValid: true; data: T[] } | { isValid: false; error: string }> {
    return new Promise<{ isValid: true; data: T[] } | { isValid: false; error: string }>(
      (resolve, reject) => {
        setTimeout(() => {
          const timer = new PerformanceTimer("convertCSVToJSON");

          Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete(results: ParseResult<T>) {
              resolve({ isValid: true, data: results.data });
              timer.log();
            },
            error(error: Error) {
              reject({ isValid: false, error: error.message });
              timer.log();
            },
          });
        }, 0);
      },
    );
  }
}
