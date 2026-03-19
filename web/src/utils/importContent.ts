/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { GeoJsonProperties, GeoJSON } from "geojson";
import Papa, { ParseResult } from "papaparse";
import z from "zod";
import { GeoJSON2DSchema } from "zod-geojson";

import { ItemValue } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ObjectSupportedType } from "@reearth-cms/components/molecules/Schema/types";
import { t } from "@reearth-cms/i18n";

import { Constant } from "./constant";
import { PerformanceTimer } from "./performance";

export type ImportContentItem = Record<string, unknown>;

export interface ValidationErrorMeta {
  exceedLimit: boolean;
  typeMismatchFieldKeys: Set<PropertyKey>;
  outOfRangeFieldKeys: Set<string>;
}

export type ContentSourceFormat = "CSV" | "JSON" | "GEOJSON";

enum CustomError {
  SUPPORTED_TYPES_INVALID = "invalid supportedTypes",
  SUPPORTED_TYPES_OUT_OF_RANGE = "supportedTypes out of range",
  EDITOR_SUPPORTED_TYPES_INVALID = "invalid editorSupportedTypes",
  EDITOR_SUPPORTED_TYPES_OUT_OF_RANGE = "editorSupportedTypes out of range",
}

export abstract class ImportContentUtils {
  public static async validateContent(
    importContentList: ImportContentItem[],
    modelFields: Model["schema"]["fields"],
    sourceFormat: ContentSourceFormat,
    maxRecordLimit = Constant.IMPORT.MAX_CONTENT_RECORDS,
  ): Promise<
    { isValid: true; data: ImportContentItem[] } | { isValid: false; error: ValidationErrorMeta }
  > {
    return new Promise<
      { isValid: true; data: ImportContentItem[] } | { isValid: false; error: ValidationErrorMeta }
    >((resolve, _reject) => {
      const timer = new PerformanceTimer("validateContentFromJSON");

      const validator = this._getValidatorMeta(modelFields, sourceFormat);

      const validation = validator.array().max(maxRecordLimit).safeParse(importContentList);

      if (validation.success) {
        resolve({ isValid: true, data: validation.data });
      } else {
        resolve({
          isValid: false,
          error: this.getErrorMeta(validation, importContentList),
        });
      }

      timer.log();
    });
  }

  private static _getValidatorMeta(
    fieldData: Model["schema"]["fields"],
    sourceFormat: ContentSourceFormat,
  ): z.ZodType<ImportContentItem> {
    const validateObj: Record<string, z.ZodTypeAny> = {};

    fieldData.forEach(field => {
      switch (field.type) {
        case "Text":
        case "TextArea":
        case "MarkdownText": {
          let stringField:
            | z.ZodString
            | z.ZodDefault<z.ZodString>
            | z.ZodOptional<z.ZodString>
            | z.ZodOptional<z.ZodDefault<z.ZodString>>
            | z.ZodDefault<z.ZodArray<z.ZodString>>
            | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString>>> = z.string();

          // validate maxLength and add into schema
          const maxLength = z.int().nonnegative().safeParse(field.typeProperty?.maxLength);
          if (maxLength.success) stringField = stringField.max(maxLength.data);

          // validate multiple and add into schema
          const multiple = z.boolean().parse(field.multiple);

          // validate defaultValue into schema with single or multiple respectively
          if (multiple) {
            const defaultValuesValidation = z
              .string()
              .min(1)
              .array()
              .refine(
                values =>
                  values.every(value => (maxLength.data ? value.length <= maxLength.data : true)),
                { error: "too_big" },
              )
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              stringField = stringField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z
              .string()
              .min(1)
              .refine(value => (maxLength.data ? value.length <= maxLength.data : true), {
                error: "too_big",
              })
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              stringField = stringField.default(defaultValueValidation.data);
          }

          if (!field.required) stringField = stringField.optional();

          validateObj[field.key] = stringField;

          break;
        }
        case "Date": {
          let dateField:
            | z.ZodCoercedDate
            | z.ZodDefault<z.ZodCoercedDate>
            | z.ZodOptional<z.ZodCoercedDate>
            | z.ZodOptional<z.ZodDefault<z.ZodCoercedDate>>
            | z.ZodOptional<z.ZodCoercedDate<unknown>>
            | z.ZodDefault<z.ZodArray<z.ZodCoercedDate<unknown>>>
            | z.ZodOptional<z.ZodDefault<z.ZodCoercedDate<unknown>>>
            | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodCoercedDate<unknown>>>> = z.coerce.date();

          // validate multiple and add into schema
          const multiple = z.boolean().parse(field.multiple);

          // validate defaultValue into schema with single or multiple respectively
          if (multiple) {
            const defaultValuesValidation = z.coerce
              .date()
              .array()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              dateField = dateField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z.coerce
              .date()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              dateField = dateField.default(defaultValueValidation.data);
          }

          if (!field.required) dateField = dateField.optional();

          validateObj[field.key] = dateField;

          break;
        }

        case "Bool": {
          let booleanField:
            | z.ZodBoolean
            | z.ZodDefault<z.ZodBoolean>
            | z.ZodOptional<z.ZodBoolean>
            | z.ZodOptional<z.ZodDefault<z.ZodBoolean>>
            | z.ZodDefault<z.ZodArray<z.ZodBoolean>>
            | z.ZodOptional<z.ZodBoolean>
            | z.ZodOptional<z.ZodDefault<z.ZodBoolean>>
            | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodBoolean>>> = z.boolean();

          // validate multiple and add into schema
          const multiple = z.boolean().parse(field.multiple);

          if (multiple) {
            const defaultValuesValidation = z
              .boolean()
              .array()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              booleanField = booleanField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z
              .boolean()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              booleanField = booleanField.default(defaultValueValidation.data);
          }

          if (!field.required) booleanField = booleanField.optional();

          validateObj[field.key] = booleanField;

          break;
        }

        case "Integer": {
          let intField:
            | z.ZodNumber
            | z.ZodDefault<z.ZodNumber>
            | z.ZodOptional<z.ZodNumber>
            | z.ZodOptional<z.ZodDefault<z.ZodNumber>>
            | z.ZodDefault<z.ZodArray<z.ZodNumber>>
            | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodNumber>>> = z.number().int();

          // validate min and add into schema
          const min = z.int().safeParse(field.typeProperty?.min);
          if (min.success) intField = intField.min(min.data);

          // validate max and add into schema
          const max = z.int().safeParse(field.typeProperty?.max);
          if (max.success) intField = intField.max(max.data);

          // max should greater than min
          if (min.success && max.success)
            intField = intField.refine(_val => max.data > min.data, {
              error: "max value should be greater than min value",
            });

          // validate multiple and add into schema
          const multiple = z.boolean().parse(field.multiple);

          // validate defaultValue into schema with single or multiple respectively
          if (multiple) {
            const defaultValuesValidation = z
              .int()
              .array()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              intField = intField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z
              .int()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              intField = intField.default(defaultValueValidation.data);
          }

          if (!field.required) intField = intField.optional();

          validateObj[field.key] = intField;

          break;
        }

        case "Number": {
          let floatField:
            | z.ZodNumber
            | z.ZodDefault<z.ZodNumber>
            | z.ZodOptional<z.ZodNumber>
            | z.ZodOptional<z.ZodDefault<z.ZodNumber>>
            | z.ZodDefault<z.ZodArray<z.ZodNumber>>
            | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodNumber>>> = z.number();

          // validate min and add into schema
          const min = z.number().safeParse(field.typeProperty?.min);
          if (min.success) floatField = floatField.min(min.data);

          // validate max and add into schema
          const max = z.number().safeParse(field.typeProperty?.max);
          if (max.success) floatField = floatField.max(max.data);

          // max should greater than min
          if (min.success && max.success)
            floatField = floatField.refine(_val => max.data > min.data, {
              error: "max value should be greater than min value",
            });

          // validate multiple and add into schema
          const multiple = z.boolean().parse(field.multiple);

          // validate defaultValue into schema with single or multiple respectively
          if (multiple) {
            const defaultValuesValidation = z
              .number()
              .array()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              floatField = floatField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z
              .number()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              floatField = floatField.default(defaultValueValidation.data);
          }

          if (!field.required) floatField = floatField.optional();

          validateObj[field.key] = floatField;

          break;
        }

        case "Select": {
          if (field.typeProperty?.values) {
            let optionField:
              | z.ZodUnion<z.ZodLiteral<string>[]>
              | z.ZodDefault<z.ZodUnion<readonly z.ZodLiteral<string>[]>>
              | z.ZodOptional<z.ZodUnion<z.ZodLiteral<string>[]>>
              | z.ZodOptional<z.ZodDefault<z.ZodUnion<readonly z.ZodLiteral<string>[]>>>
              | z.ZodOptional<z.ZodOptional<z.ZodUnion<z.ZodLiteral<string>[]>>>
              | z.ZodOptional<
                  z.ZodOptional<z.ZodDefault<z.ZodUnion<readonly z.ZodLiteral<string>[]>>>
                >
              | z.ZodArray<z.ZodUnion<z.ZodLiteral<string>[]>>
              | z.ZodDefault<z.ZodArray<z.ZodUnion<z.ZodLiteral<string>[]>>>
              | z.ZodOptional<z.ZodArray<z.ZodUnion<z.ZodLiteral<string>[]>>>
              | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodUnion<z.ZodLiteral<string>[]>>>> =
              z.union(field.typeProperty.values.map(value => z.literal(value)));

            // validate multiple and add into schema
            const multiple = z.boolean().parse(field.multiple);

            // validate defaultValue into schema with single or multiple respectively
            if (multiple) {
              const defaultValuesValidation = z
                .union(field.typeProperty.values.map(value => z.literal(value)))
                .array()
                .optional()
                .safeParse(field.typeProperty?.selectDefaultValue);

              if (defaultValuesValidation.success && defaultValuesValidation.data)
                optionField = optionField.array().default(defaultValuesValidation.data);
              else optionField = optionField.array();
            } else {
              const defaultValueValidation = z
                .union(field.typeProperty.values.map(value => z.literal(value)))
                .optional()
                .safeParse(field.typeProperty?.selectDefaultValue);

              if (defaultValueValidation.success && defaultValueValidation.data)
                optionField = optionField.default(defaultValueValidation.data);
            }

            if (!field.required) optionField = optionField.optional();

            validateObj[field.key] = optionField;
          }

          break;
        }

        case "URL": {
          let urlField:
            | z.ZodURL
            | z.ZodOptional<z.ZodURL>
            | z.ZodDefault<z.ZodArray<z.ZodURL>>
            | z.ZodDefault<z.ZodURL>
            | z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodURL>>>
            | z.ZodOptional<z.ZodDefault<z.ZodURL>> = z.url();

          // validate multiple and add into schema
          const multiple = z.boolean().parse(field.multiple);

          // validate defaultValue into schema with single or multiple respectively
          if (multiple) {
            const defaultValuesValidation = z
              .url()
              .array()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              urlField = urlField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z
              .url()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              urlField = urlField.default(defaultValueValidation.data);
          }

          if (!field.required) urlField = urlField.optional();

          validateObj[field.key] = urlField;

          break;
        }

        case "GeometryObject": {
          // CSV file cannot contain geometry object
          if (sourceFormat === "JSON") {
            const supportedTypes = z
              .union([
                z.literal("POINT"),
                z.literal("MULTIPOINT"),
                z.literal("LINESTRING"),
                z.literal("MULTILINESTRING"),
                z.literal("POLYGON"),
                z.literal("MULTIPOLYGON"),
                z.literal("GEOMETRYCOLLECTION"),
              ])
              .array()
              .safeParse(field.typeProperty?.objectSupportedTypes);

            let geoObjectField: z.ZodTypeAny = GeoJSON2DSchema.superRefine((_value, context) => {
              if (!supportedTypes.success) {
                context.addIssue({
                  code: "custom",
                  input: field.typeProperty?.objectSupportedTypes,
                  expected:
                    "POINT | MULTIPOINT | LINESTRING | MULTILINESTRING | POLYGON | MULTIPOLYGON | GEOMETRYCOLLECTION",
                  message: CustomError.SUPPORTED_TYPES_INVALID,
                });
              }
            });

            // validate multiple and add into schema
            const multiple = z.boolean().parse(field.multiple);

            // validate defaultValue into schema with single or multiple respectively
            if (multiple) {
              const defaultValuesValidation = GeoJSON2DSchema.array()
                .optional()
                .safeParse(field.typeProperty?.defaultValue);

              if (defaultValuesValidation.success && defaultValuesValidation.data)
                geoObjectField = geoObjectField.array().default(defaultValuesValidation.data);
              else geoObjectField = geoObjectField.array();
            } else {
              const defaultValueValidation = GeoJSON2DSchema.optional().safeParse(
                field.typeProperty?.defaultValue,
              );

              if (defaultValueValidation.success && defaultValueValidation.data)
                geoObjectField = geoObjectField.default(defaultValueValidation.data);

              geoObjectField = geoObjectField.superRefine((value, context) => {
                // TODO: refactor this later
                const valueType =
                  typeof value === "object" &&
                  value !== null &&
                  "type" in value &&
                  typeof value.type === "string"
                    ? value.type.toUpperCase()
                    : null;

                if (
                  supportedTypes.success &&
                  valueType &&
                  !supportedTypes.data.includes(valueType as ObjectSupportedType)
                ) {
                  context.addIssue({
                    code: "custom",
                    input: valueType,
                    expected: supportedTypes.data.join(" | "),
                    message: CustomError.SUPPORTED_TYPES_OUT_OF_RANGE,
                  });
                }
              });
            }

            if (!field.required) geoObjectField = geoObjectField.optional();

            validateObj[field.key] = geoObjectField;
          }

          break;
        }

        case "GeometryEditor": {
          // CSV file cannot contain geometry object
          if (sourceFormat === "JSON") {
            const editorSupportedTypes = z
              .union([
                z.literal("POINT"),
                z.literal("LINESTRING"),
                z.literal("POLYGON"),
                z.literal("ANY"),
              ])
              .array()
              .safeParse(field.typeProperty?.editorSupportedTypes);

            let geoEditorField: z.ZodTypeAny = GeoJSON2DSchema.superRefine((_value, context) => {
              if (!editorSupportedTypes.success) {
                context.addIssue({
                  code: "custom",
                  input: field.typeProperty?.editorSupportedTypes,
                  expected: "POINT, LINESTRING, POLYGON, ANY",
                  message: CustomError.EDITOR_SUPPORTED_TYPES_INVALID,
                });
              }
            });

            // validate multiple and add into schema
            const multiple = z.boolean().parse(field.multiple);

            // validate defaultValue into schema with single or multiple respectively
            if (multiple) {
              const defaultValuesValidation = GeoJSON2DSchema.array()
                .optional()
                .safeParse(field.typeProperty?.defaultValue);

              if (defaultValuesValidation.success && defaultValuesValidation.data)
                geoEditorField = geoEditorField.array().default(defaultValuesValidation.data);
              else geoEditorField = geoEditorField.array();
            } else {
              const defaultValueValidation = GeoJSON2DSchema.optional().safeParse(
                field.typeProperty?.defaultValue,
              );

              if (defaultValueValidation.success && defaultValueValidation.data)
                geoEditorField = geoEditorField.default(defaultValueValidation.data);

              geoEditorField = geoEditorField.superRefine((value, context) => {
                // TODO: refactor this later
                const valueType =
                  typeof value === "object" &&
                  value !== null &&
                  "type" in value &&
                  typeof value.type === "string"
                    ? value.type.toUpperCase()
                    : null;

                if (
                  editorSupportedTypes.success &&
                  valueType &&
                  !editorSupportedTypes.data.some(type => type === valueType)
                ) {
                  context.addIssue({
                    code: "custom",
                    input: valueType,
                    expected: editorSupportedTypes.data.join(" | "),
                    message: CustomError.EDITOR_SUPPORTED_TYPES_OUT_OF_RANGE,
                  });
                }
              });
            }

            if (!field.required) geoEditorField = geoEditorField.optional();

            validateObj[field.key] = geoEditorField;
          }

          break;
        }

        default:
      }
    });

    return z.object(validateObj) as z.ZodType<ImportContentItem>;
  }

  private static getErrorMeta(
    schemaValidation: z.ZodSafeParseError<Record<string, unknown>[]>,
    contentList: Record<string, unknown>[],
  ): ValidationErrorMeta {
    return schemaValidation.error.issues.reduce<ValidationErrorMeta>(
      (acc, curr, _index, _arr) => {
        // exceed limit records
        if (curr.code === "too_big" && curr.origin === "array" && curr.path.length === 0)
          return { ...acc, exceedLimit: true };

        // invalid value type
        if (curr.path[1] && curr.code === "invalid_type")
          return { ...acc, typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(curr.path[1]) };

        // invalid value type (date)
        if (curr.path[1] && curr.code === "invalid_format" && curr.format === "url")
          return { ...acc, typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(curr.path[1]) };

        // TODO: need to improve
        // invalid default value
        if (curr.path.length === 0 && curr.code === "invalid_type")
          return { ...acc, typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(curr.path[1]) };

        // invalid option for select (union of literals)
        if (curr.path[1] && curr.code === "invalid_union") {
          const rowIndex = curr.path[0];
          const fieldKey = curr.path[1];
          if (
            typeof rowIndex === "number" &&
            typeof fieldKey === "string" &&
            !(fieldKey in contentList[rowIndex])
          )
            return {
              ...acc,
              typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(fieldKey),
            };
          if (typeof fieldKey === "string") acc.outOfRangeFieldKeys.add(fieldKey);
          return { ...acc, outOfRangeFieldKeys: acc.outOfRangeFieldKeys };
        }

        if (
          // number out of range (too big or too small)
          ((curr.code === "too_big" || curr.code === "too_small") && curr.origin === "number") ||
          // string out of range (too big)
          (curr.code === "too_big" && curr.origin === "string")
        ) {
          if (typeof curr.path[1] === "string") acc.outOfRangeFieldKeys.add(curr.path[1]);
          return { ...acc, outOfRangeFieldKeys: acc.outOfRangeFieldKeys };
        }

        // custom error (GeoObject, GeoEditor)
        if (curr.code === "custom") {
          if (
            curr.message === CustomError.SUPPORTED_TYPES_INVALID ||
            curr.message === CustomError.EDITOR_SUPPORTED_TYPES_INVALID
          ) {
            return { ...acc, typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(curr.path[1]) };
          }

          if (
            curr.message === CustomError.SUPPORTED_TYPES_OUT_OF_RANGE ||
            curr.message === CustomError.EDITOR_SUPPORTED_TYPES_OUT_OF_RANGE
          ) {
            if (typeof curr.path[1] === "string") acc.outOfRangeFieldKeys.add(curr.path[1]);
            return { ...acc, outOfRangeFieldKeys: acc.outOfRangeFieldKeys };
          }
        }

        return acc;
      },
      {
        exceedLimit: false,
        typeMismatchFieldKeys: new Set(),
        outOfRangeFieldKeys: new Set(),
      },
    );
  }

  public static convertCSVToJSON<T extends Record<string, unknown>>(
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

  public static async convertGeoJSONToJSON(
    raw: GeoJSON,
  ): Promise<
    { isValid: true; data: Record<string, ItemValue>[] } | { isValid: false; error: string }
  > {
    return new Promise<
      { isValid: true; data: Record<string, ItemValue>[] } | { isValid: false; error: string }
    >((resolve, _reject) => {
      const timer = new PerformanceTimer("convertGeoJSONToJSON");

      if (raw.type !== "FeatureCollection") {
        resolve({ isValid: false, error: "Not feature collection" });
        timer.log();
        return;
      }

      const propertiesFromCollection = raw.features.reduce<NonNullable<GeoJsonProperties>[]>(
        (acc, curr) => (curr.properties ? [...acc, curr.properties] : acc),
        [],
      );

      timer.log();
      resolve({ isValid: true, data: propertiesFromCollection });
    });
  }

  public static getUIMetadata(params: {
    hasContentCreateRight: boolean;
    hasModelFields: boolean;
  }): {
    tooltipMessage: string | undefined;
    shouldDisable: boolean;
  } {
    const { hasModelFields, hasContentCreateRight } = params;
    return {
      tooltipMessage: !hasContentCreateRight
        ? t("Reader cannot import content.")
        : !hasModelFields
          ? t("Please create a schema first")
          : undefined,
      shouldDisable: !hasModelFields || !hasContentCreateRight,
    };
  }
}
