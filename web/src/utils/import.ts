/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { getIssues, HintIssue } from "@placemarkio/check-geojson";
import type { GeoJSON } from "geojson";
import Papa, { ParseResult } from "papaparse";
import {
  z,
  ZodBoolean,
  ZodCoercedDate,
  ZodCoercedNumber,
  ZodJSONSchema,
  ZodNumber,
  ZodOptional,
  ZodString,
  ZodURL,
} from "zod";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  type SchemaFieldType,
  SchemaFieldType as SchemaFieldTypeConst,
} from "@reearth-cms/components/molecules/Schema/types";
import { PerformanceTimer } from "@reearth-cms/utils/performance";

import { Constant } from "./constant";

interface FieldBase {
  title: string;
  description: string;
  type: SchemaFieldType;
  required: boolean;
  multiple: boolean;
  unique: boolean;
}

interface FieldTextBase extends FieldBase {
  maxLength?: number;
  defaultValue?: string | string[];
}

interface FieldNumberBase extends FieldBase {
  maximum?: number;
  minimum?: number;
  defaultValue?: number | number[];
}

interface FieldText extends FieldTextBase {
  type: "Text";
}

interface FieldTextArea extends FieldTextBase {
  type: "TextArea";
}

interface FieldMarkdownText extends FieldTextBase {
  type: "MarkdownText";
}

interface FieldAsset extends FieldBase {
  type: "Asset";
  defaultValue?: string | string[];
}

interface FieldBoolean extends FieldBase {
  type: "Bool";
  defaultValue?: boolean | boolean[];
}

interface FieldDate extends FieldBase {
  type: "Date";
  defaultValue?: string | string[];
}

interface FieldNumber extends FieldNumberBase {
  type: "Number";
  defaultValue?: number | number[];
}

interface FieldInteger extends FieldNumberBase {
  type: "Integer";
  defaultValue?: number | number[];
}

// interface FieldGeoObject extends FieldBase {
//   type: "GeometryObject";
//   defaultValue?: GeoJSON;
// }

// interface FieldGeoEditor extends FieldBase {
//   type: "GeometryEditor";
// }

interface FieldSelect extends FieldBase {
  type: "Select";
  values: string[];
  defaultValue?: string | string[];
}

interface FieldUrl extends FieldBase {
  type: "URL";
  defaultValue?: string | string[];
}

export type ImportSchemaField =
  | FieldText
  | FieldTextArea
  | FieldMarkdownText
  | FieldNumber
  | FieldInteger
  | FieldBoolean
  | FieldDate
  | FieldAsset
  | FieldSelect
  | FieldUrl;
// | FieldGeoEditor
// | FieldGeoObject;

export interface ImportSchema {
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
          let stringField: ZodString | ZodOptional<ZodString> = z.string();

          if (field.typeProperty?.maxLength)
            stringField = stringField.max(field.typeProperty.maxLength);

          if (field.required) stringField = stringField.optional();

          validateObj[field.key] = stringField;
          acceptImportFieldCount++;

          break;
        }
        case "Date": {
          let dateField: ZodCoercedDate | ZodOptional<ZodCoercedDate> = z.coerce.date();

          if (field.required) dateField = dateField.optional();

          validateObj[field.key] = dateField;
          acceptImportFieldCount++;

          break;
        }

        case "Bool": {
          let booleanField: ZodBoolean | ZodOptional<ZodBoolean> = z.boolean();

          if (field.required) booleanField = booleanField.optional();

          validateObj[field.key] = booleanField;
          acceptImportFieldCount++;

          break;
        }

        case "Integer": {
          let intField: ZodCoercedNumber | ZodOptional<ZodCoercedNumber> = z.coerce.number().int();

          if (field.typeProperty?.max) intField = intField.max(field.typeProperty.max);
          if (field.typeProperty?.min) intField = intField.min(field.typeProperty.min);
          if (field.required) intField = intField.optional();

          validateObj[field.key] = intField;
          acceptImportFieldCount++;

          break;
        }

        case "Number": {
          let floatField: ZodNumber | ZodOptional<ZodNumber> = z.coerce.number();

          if (field.typeProperty?.numberMax)
            floatField = floatField.max(field.typeProperty.numberMax);
          if (field.typeProperty?.min) floatField = floatField.min(field.typeProperty.min);
          if (field.required) floatField = floatField.optional();

          validateObj[field.key] = floatField;
          acceptImportFieldCount++;

          break;
        }

        case "Select": {
          if (field.typeProperty?.values) {
            let optionField:
              | z.ZodUnion<z.ZodLiteral<string>[]>
              | ZodOptional<z.ZodUnion<z.ZodLiteral<string>[]>> = z.union(
              field.typeProperty.values.map(value => z.literal(value)),
            );

            if (field.required) optionField = optionField.optional();

            validateObj[field.key] = optionField;
            acceptImportFieldCount++;
          }

          break;
        }

        case "URL": {
          let urlField: ZodURL | ZodOptional<ZodURL> = z.url();

          if (field.required) urlField = urlField.optional();

          validateObj[field.key] = urlField;
          acceptImportFieldCount++;

          break;
        }

        case "GeometryObject": {
          // CSV file cannot contain geometry object
          if (sourceFormat === "JSON") {
            let geoObjField: ZodJSONSchema | ZodOptional<ZodJSONSchema> = z.json().refine(
              val => {
                if (!val) return false;
                const issues: HintIssue[] = getIssues(JSON.stringify(val));
                return !(issues.length > 0);
              },
              { error: "Invalid GeometryObject format." },
            );

            if (field.required) geoObjField = geoObjField.optional();

            validateObj[field.key] = geoObjField;
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
    description: z.string(),
    type: z.union(Object.values(SchemaFieldTypeConst).map(value => z.literal(value))),
    required: z.boolean(),
    multiple: z.boolean(),
    unique: z.boolean(),
  });

  private static readonly FIELD_TEXT_BASE_VALIDATOR: z.ZodSchema<FieldTextBase> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      defaultValue: z.union([z.string(), z.string().array()]),
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly IMPORT_SCHEMA_VALIDATOR: z.ZodSchema<ImportSchema> = z.object({
    properties: z.record(
      z.string(),
      z.union([
        z
          .object({
            type: z.literal("Text"),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("TextArea"),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("MarkdownText"),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("Asset"),
            defaultValue: z.union([z.string(), z.string().array()]).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("Bool"),
            defaultValue: z.union([z.boolean(), z.boolean().array()]).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("Date"),
            defaultValue: z.union([z.string(), z.string().array()]).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("Number"),
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            defaultValue: z.union([z.number(), z.number().array()]).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("Integer"),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            defaultValue: z.union([z.int(), z.int().array()]).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        // z
        //   .object({
        //     type: z.literal("GeometryObject"),
        //     defaultValue: GeoJSONSchema.optional(), // TODO: fix THIS!
        //   })
        //   .and(this.FIELD_BASE_VALIDATOR),
        // z
        //   .object({
        //     type: z.literal("GeometryEditor"),
        //   })
        //   .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("Select"),
            values: z.string().array(),
            defaultValue: z.union([z.string(), z.string().array()]).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal("URL"),
            defaultValue: z.union([z.url(), z.url().array()]).optional(),
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
        // exceed limit records
        if (curr.code === "too_big" && curr.origin === "array")
          return { ...acc, exceedLimit: true };

        // illegal key, invalid type
        if (
          curr.path[1] &&
          // invalid type, invalid key
          (curr.code === "invalid_type" ||
            // invalid option (for select)
            curr.code === "invalid_union" ||
            // number out of range (too big or too small)
            ((curr.code === "too_big" || curr.code === "too_small") && curr.origin === "number"))
        )
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
