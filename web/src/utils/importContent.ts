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

type FieldErrorCategory = "typeMismatch" | "outOfRange";

type FieldClassifier = (
  issue: z.core.$ZodIssue,
  contentList: Record<string, unknown>[],
) => FieldErrorCategory | null;

interface ValidatorWithClassifiers {
  schema: z.ZodType<ImportContentItem>;
  classifiers: Record<string, FieldClassifier>;
}

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

      const { schema: validator, classifiers } = this.getValidatorMeta(modelFields, sourceFormat);

      const validation = validator.array().max(maxRecordLimit).safeParse(importContentList);

      if (validation.success) {
        resolve({ isValid: true, data: validation.data });
      } else {
        resolve({
          isValid: false,
          error: this.getErrorMeta(validation, importContentList, classifiers),
        });
      }

      timer.log();
    });
  }

  private static getValidatorMeta(
    fieldData: Model["schema"]["fields"],
    sourceFormat: ContentSourceFormat,
  ): ValidatorWithClassifiers {
    const validateObj: Record<string, z.ZodTypeAny> = {};
    const classifiers: Record<string, FieldClassifier> = {};

    fieldData.forEach(field => {
      switch (field.type) {
        case "Text":
        case "TextArea":
        case "MarkdownText": {
          let stringField: z.ZodString = z.string();

          // validate maxLength and add into schema
          const maxLength = z.int().nonnegative().safeParse(field.typeProperty?.maxLength);
          if (maxLength.success) stringField = stringField.max(maxLength.data);

          let stringFieldAny: z.ZodTypeAny = stringField;

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
              stringFieldAny = stringFieldAny.array().default(defaultValuesValidation.data);
            else stringFieldAny = stringFieldAny.array();
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
              stringFieldAny = stringFieldAny.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required
            ? stringFieldAny.nullable().optional()
            : stringFieldAny;
          classifiers[field.key] = this.typeAndRangeClassifier();

          break;
        }
        case "Date": {
          // Use preprocess to convert input to Date while rejecting null/undefined
          // (z.coerce.date() alone would coerce null to epoch via new Date(null))
          let dateField: z.ZodTypeAny = z.preprocess(
            val => (val === null || val === undefined ? val : new Date(val as string | number)),
            z.date(),
          );

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
            else dateField = dateField.array();
          } else {
            const defaultValueValidation = z.coerce
              .date()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              dateField = dateField.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required ? dateField.nullable().optional() : dateField;
          classifiers[field.key] = this.typeOnlyClassifier();

          break;
        }

        case "Bool": {
          let booleanField: z.ZodTypeAny = z.boolean();

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
            else booleanField = booleanField.array();
          } else {
            const defaultValueValidation = z
              .boolean()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              booleanField = booleanField.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required
            ? booleanField.nullable().optional()
            : booleanField;
          classifiers[field.key] = this.typeOnlyClassifier();

          break;
        }

        case "Integer": {
          let intField: z.ZodNumber = z.number().int();

          // validate min and add into schema
          const min = z.int().safeParse(field.typeProperty?.min);
          if (min.success) intField = intField.min(min.data);

          // validate max and add into schema
          const max = z.int().safeParse(field.typeProperty?.max);
          if (max.success) intField = intField.max(max.data);

          let intFieldAny: z.ZodTypeAny = intField;

          // max should greater than min
          if (min.success && max.success)
            intFieldAny = intFieldAny.refine(_val => max.data > min.data, {
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
              intFieldAny = intFieldAny.array().default(defaultValuesValidation.data);
            else intFieldAny = intFieldAny.array();
          } else {
            const defaultValueValidation = z
              .int()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              intFieldAny = intFieldAny.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required
            ? intFieldAny.nullable().optional()
            : intFieldAny;
          classifiers[field.key] = this.typeAndRangeClassifier();

          break;
        }

        case "Number": {
          let floatField: z.ZodNumber = z.number();

          // validate min and add into schema
          const min = z.number().safeParse(field.typeProperty?.min);
          if (min.success) floatField = floatField.min(min.data);

          // validate max and add into schema
          const max = z.number().safeParse(field.typeProperty?.max);
          if (max.success) floatField = floatField.max(max.data);

          let floatFieldAny: z.ZodTypeAny = floatField;

          // max should greater than min
          if (min.success && max.success)
            floatFieldAny = floatFieldAny.refine(_val => max.data > min.data, {
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
              floatFieldAny = floatFieldAny.array().default(defaultValuesValidation.data);
            else floatFieldAny = floatFieldAny.array();
          } else {
            const defaultValueValidation = z
              .number()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              floatFieldAny = floatFieldAny.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required
            ? floatFieldAny.nullable().optional()
            : floatFieldAny;
          classifiers[field.key] = this.typeAndRangeClassifier();

          break;
        }

        case "Select": {
          if (field.typeProperty?.values) {
            let optionField: z.ZodTypeAny = z.union(
              field.typeProperty.values.map(value => z.literal(value)),
            );

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

            validateObj[field.key] = !field.required
              ? optionField.nullable().optional()
              : optionField;
            classifiers[field.key] = this.selectClassifier();
          }

          break;
        }

        case "Asset": {
          let assetField: z.ZodTypeAny = z.string().min(1);

          const multiple = z.boolean().parse(field.multiple);

          if (multiple) {
            const defaultValuesValidation = z
              .string()
              .min(1)
              .array()
              .optional()
              .safeParse(field.typeProperty?.assetDefaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              assetField = assetField.array().default(defaultValuesValidation.data);
            else assetField = assetField.array();
          } else {
            const defaultValueValidation = z
              .string()
              .min(1)
              .optional()
              .safeParse(field.typeProperty?.assetDefaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              assetField = assetField.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required
            ? assetField.nullable().optional()
            : assetField;
          classifiers[field.key] = this.typeOnlyClassifier();

          break;
        }

        case "URL": {
          let urlField: z.ZodTypeAny = z.url();

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
            else urlField = urlField.array();
          } else {
            const defaultValueValidation = z
              .url()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValueValidation.success && defaultValueValidation.data)
              urlField = urlField.default(defaultValueValidation.data);
          }

          validateObj[field.key] = !field.required ? urlField.nullable().optional() : urlField;
          classifiers[field.key] = this.urlClassifier();

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

              //  geoObjectField.superRefine((value, context) => {

              // })
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

            validateObj[field.key] = !field.required
              ? geoObjectField.nullable().optional()
              : geoObjectField;
            classifiers[field.key] = this.geoClassifier(
              CustomError.SUPPORTED_TYPES_INVALID,
              CustomError.SUPPORTED_TYPES_OUT_OF_RANGE,
            );
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

            validateObj[field.key] = !field.required
              ? geoEditorField.nullable().optional()
              : geoEditorField;
            classifiers[field.key] = this.geoClassifier(
              CustomError.EDITOR_SUPPORTED_TYPES_INVALID,
              CustomError.EDITOR_SUPPORTED_TYPES_OUT_OF_RANGE,
            );
          }

          break;
        }

        default:
      }
    });

    return { schema: z.object(validateObj) as z.ZodType<ImportContentItem>, classifiers };
  }

  private static getErrorMeta(
    schemaValidation: z.ZodSafeParseError<Record<string, unknown>[]>,
    contentList: Record<string, unknown>[],
    classifiers: Record<string, FieldClassifier>,
  ): ValidationErrorMeta {
    return schemaValidation.error.issues.reduce<ValidationErrorMeta>(
      (acc, issue) => {
        // Top-level: array exceeds record limit
        if (issue.code === "too_big" && issue.origin === "array" && issue.path.length === 0) {
          acc.exceedLimit = true;
          return acc;
        }

        const fieldKey = issue.path[1];
        if (typeof fieldKey !== "string") return acc;

        const classifier = classifiers[fieldKey];
        if (!classifier) return acc;

        const category = classifier(issue, contentList);
        if (category === "typeMismatch") acc.typeMismatchFieldKeys.add(fieldKey);
        else if (category === "outOfRange") acc.outOfRangeFieldKeys.add(fieldKey);

        return acc;
      },
      { exceedLimit: false, typeMismatchFieldKeys: new Set(), outOfRangeFieldKeys: new Set() },
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

  private static typeOnlyClassifier(): FieldClassifier {
    return issue => {
      if (issue.code === "invalid_type") return "typeMismatch";
      return null;
    };
  }

  private static typeAndRangeClassifier(): FieldClassifier {
    return issue => {
      if (issue.code === "invalid_type") return "typeMismatch";
      if (issue.code === "too_big" || issue.code === "too_small") return "outOfRange";
      return null;
    };
  }

  private static urlClassifier(): FieldClassifier {
    return issue => {
      if (issue.code === "invalid_type") return "typeMismatch";
      if (issue.code === "invalid_format" && "format" in issue && issue.format === "url")
        return "typeMismatch";
      return null;
    };
  }

  private static selectClassifier(): FieldClassifier {
    return (issue, contentList) => {
      if (issue.code === "invalid_type") return "typeMismatch";
      if (issue.code === "invalid_union") {
        const rowIndex = issue.path[0];
        const fieldKey = issue.path[1];
        if (
          typeof rowIndex === "number" &&
          typeof fieldKey === "string" &&
          contentList[rowIndex] &&
          !(fieldKey in contentList[rowIndex])
        ) {
          return "typeMismatch";
        }
        return "outOfRange";
      }
      return null;
    };
  }

  private static geoClassifier(invalidMsg: string, outOfRangeMsg: string): FieldClassifier {
    return issue => {
      if (issue.code === "custom") {
        if (issue.message === invalidMsg) return "typeMismatch";
        if (issue.message === outOfRangeMsg) return "outOfRange";
      }
      // Other errors (from GeoJSON2DSchema validation) are type mismatches
      if (issue.code === "invalid_type" || issue.code === "invalid_union") return "typeMismatch";
      return null;
    };
  }
}
