/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { getIssues, HintIssue } from "@placemarkio/check-geojson";
import z from "zod";

import { ItemValue } from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ObjectSupportedType } from "@reearth-cms/components/molecules/Schema/types";

import { Constant } from "./constant";
import { PerformanceTimer } from "./performance";

// type ImportContentResultItemValue = string | string[] | number | number[] | boolean | boolean[];

type ImportContentResultItem = Record<string, ItemValue>;

export interface ImportContentJSON2 {
  results: ImportContentResultItem[];
  totalCount: number;
}

export interface ValidationErrorMeta2 {
  exceedLimit: boolean;
  typeMismatchFieldKeys: Set<PropertyKey>;
  outOfRangeFieldKeys: Set<string>;
}

// export interface ErrorMeta2 extends ValidationErrorMeta2 {
//   missedFieldKeys: Set<string>;
//   illegalFieldKeys: Set<string>;
//   legalFieldKeys: Set<string>;
// }

type ContentSourceFormat2 = "CSV" | "JSON" | "GEOJSON";

export abstract class ImportContentUtils {
  public static async validateContentFromJSON(
    importContentList: ImportContentJSON2["results"],
    modelFields: Model["schema"]["fields"],
    maxRecordLimit = Constant.IMPORT.MAX_CONTENT_RECORDS,
  ): Promise<
    | { isValid: true; data: ImportContentJSON2["results"] }
    | { isValid: false; error: ValidationErrorMeta2 }
  > {
    return new Promise<
      | { isValid: true; data: ImportContentJSON2["results"] }
      | { isValid: false; error: ValidationErrorMeta2 }
    >((resolve, _reject) => {
      const timer = new PerformanceTimer("validateContentFromJSON");

      const validator = this.getValidatorMeta(modelFields, "JSON");

      // console.log("=".repeat(100));
      // console.log("importContentList", importContentList);
      // console.log("modelFields", modelFields);
      // console.log("maxRecordLimit", maxRecordLimit);
      // console.log("=".repeat(100));

      const validation = validator.array().max(maxRecordLimit).safeParse(importContentList);

      // console.log("=".repeat(50), "validation", "=".repeat(50));
      // console.log("validation", validation);
      // console.log("=".repeat(100));

      if (validation.success) {
        resolve({ isValid: true, data: validation.data });
      } else {
        // console.log("validation", validation.error.message);
        resolve({
          isValid: false,
          error: this.getErrorMeta(validation),
        });
      }

      timer.log();
    });
  }

  private static getValidatorMeta(
    fieldData: Model["schema"]["fields"],
    sourceFormat: ContentSourceFormat2,
  ): z.ZodType<ImportContentResultItem> {
    const validateObj: Record<string, unknown> = {};
    // const validateObj = {};

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
            const defaultValuesValidation = z
              .date()
              .array()
              .optional()
              .safeParse(field.typeProperty?.defaultValue);

            if (defaultValuesValidation.success && defaultValuesValidation.data)
              dateField = dateField.array().default(defaultValuesValidation.data);
          } else {
            const defaultValueValidation = z
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
              | z.ZodDefault<z.ZodArray<z.ZodUnion<z.ZodLiteral<string>[]>>>
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
                .safeParse(field.typeProperty?.defaultValue);

              if (defaultValuesValidation.success && defaultValuesValidation.data)
                optionField = optionField.array().default(defaultValuesValidation.data);
            } else {
              const defaultValueValidation = z
                .union(field.typeProperty.values.map(value => z.literal(value)))
                .optional()
                .safeParse(field.typeProperty?.defaultValue);

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

        // TODO: add multiple, default later
        case "GeometryObject": {
          // CSV file cannot contain geometry object
          if (sourceFormat === "JSON") {
            let geoObjField:
              | z.ZodJSONSchema
              | z.ZodDefault<z.ZodJSONSchema>
              | z.ZodOptional<z.ZodJSONSchema>
              | z.ZodOptional<z.ZodDefault<z.ZodJSONSchema>> = z.json().refine(
              val => {
                if (!val) return false;
                if (
                  typeof val === "object" &&
                  !Array.isArray(val) &&
                  field.typeProperty?.objectSupportedTypes &&
                  val.type &&
                  field.typeProperty.objectSupportedTypes.includes(val.type as ObjectSupportedType)
                )
                  return false;

                const issues: HintIssue[] = getIssues(JSON.stringify(val));
                return !(issues.length > 0);
              },
              { error: "Invalid GeometryObject format." },
            );

            if (
              field.typeProperty?.defaultValue &&
              typeof field.typeProperty.defaultValue === "string" &&
              z.url().safeParse(field.typeProperty.defaultValue).success
            )
              geoObjField = geoObjField.default(field.typeProperty.defaultValue);

            if (!field.required) geoObjField = geoObjField.optional();

            validateObj[field.key] = geoObjField;
          }

          break;
        }
        default:
      }
    });

    return z.object(validateObj) as z.ZodType<ImportContentResultItem>;
    // return z.object(validateObj);
  }

  private static getErrorMeta(
    schemaValidation: z.ZodSafeParseError<Record<string, unknown>[]>,
  ): ValidationErrorMeta2 {
    return schemaValidation.error.issues.reduce<ValidationErrorMeta2>(
      (acc, curr, _index, _arr) => {
        // console.log("curr5566", JSON.stringify(curr, null, 2));
        // exceed limit records
        if (curr.code === "too_big" && curr.origin === "array" && curr.path.length === 0)
          return { ...acc, exceedLimit: true };

        // invalid value type
        if (curr.path[1] && curr.code === "invalid_type")
          return { ...acc, typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(curr.path[1]) };

        // TODO: need to improve
        // invalid default value
        if (curr.path.length === 0 && curr.code === "invalid_type")
          return { ...acc, typeMismatchFieldKeys: acc.typeMismatchFieldKeys.add(curr.path[1]) };

        if (
          (curr.path[1] &&
            // invalid option (for select)
            curr.code === "invalid_union") ||
          // number out of range (too big or too small)
          ((curr.code === "too_big" || curr.code === "too_small") && curr.origin === "number") ||
          // string out of range (too big)
          (curr.code === "too_big" && curr.origin === "string")
        ) {
          if (typeof curr.path[1] === "string") acc.outOfRangeFieldKeys.add(curr.path[1]);
          return { ...acc, outOfRangeFieldKeys: acc.outOfRangeFieldKeys };
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
}
