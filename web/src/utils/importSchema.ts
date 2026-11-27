/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import z from "zod";

import type { TooltipProps } from "@reearth-cms/components/atoms/Tooltip";
import { ExportSchemaFieldType } from "@reearth-cms/components/molecules/Schema/types";
import { t } from "@reearth-cms/i18n";

import { PerformanceTimer } from "./performance";

interface FieldBase {
  title: string;
  description?: string;
  "x-fieldType": ExportSchemaFieldType;
  "x-required"?: boolean;
  "x-multiple"?: boolean;
  "x-unique"?: boolean;
}

// text common
interface FieldTextBase extends FieldBase {
  maxLength?: number;
  "x-multiple"?: false;
  "x-defaultValue"?: string;
}

interface FieldTextBaseMulti extends FieldBase {
  maxLength?: number;
  "x-multiple"?: true;
  "x-defaultValue"?: string[];
}

// number common
interface FieldNumberBase extends FieldBase {
  maximum?: number;
  minimum?: number;
  "x-multiple"?: false;
  "x-defaultValue"?: number;
}

interface FieldNumberBaseMulti extends FieldBase {
  maximum?: number;
  minimum?: number;
  "x-multiple"?: true;
  "x-defaultValue"?: number[];
}

// fields
export interface FieldText extends FieldTextBase {
  "x-fieldType": ExportSchemaFieldType.Text;
}

export interface FieldTextMulti extends FieldTextBaseMulti {
  "x-fieldType": ExportSchemaFieldType.Text;
}

export interface FieldTextArea extends FieldTextBase {
  "x-fieldType": ExportSchemaFieldType.TextArea;
}

export interface FieldTextAreaMulti extends FieldTextBaseMulti {
  "x-fieldType": ExportSchemaFieldType.TextArea;
}

export interface FieldMarkdownText extends FieldTextBase {
  "x-fieldType": ExportSchemaFieldType.Markdown;
}

export interface FieldMarkdownTextMulti extends FieldTextBaseMulti {
  "x-fieldType": ExportSchemaFieldType.Markdown;
}

export interface FieldURL extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.URL;
  "x-multiple"?: false;
  "x-defaultValue"?: string;
}

export interface FieldURLMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.URL;
  "x-multiple"?: true;
  "x-defaultValue"?: string[];
}

export interface FieldAsset extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Asset;
  "x-multiple"?: false;
  "x-defaultValue"?: string;
}

export interface FieldAssetMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Asset;
  "x-multiple"?: true;
  "x-defaultValue"?: string[];
}

export interface FieldInteger extends FieldNumberBase {
  "x-fieldType": ExportSchemaFieldType.Integer;
}

export interface FieldIntegerMulti extends FieldNumberBaseMulti {
  "x-fieldType": ExportSchemaFieldType.Integer;
}

export interface FieldNumber extends FieldNumberBase {
  "x-fieldType": ExportSchemaFieldType.Number;
}

export interface FieldNumberMulti extends FieldNumberBaseMulti {
  "x-fieldType": ExportSchemaFieldType.Number;
}

export interface FieldBoolean extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Bool;
  "x-multiple"?: false;
  "x-defaultValue"?: boolean;
}

export interface FieldBooleanMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Bool;
  "x-multiple"?: true;
  "x-defaultValue"?: boolean[];
}

export interface FieldDate extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Datetime;
  "x-multiple"?: false;
  "x-defaultValue"?: string;
}

export interface FieldDateMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Datetime;
  "x-multiple"?: true;
  "x-defaultValue"?: string[];
}

export interface FieldSelect extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Select;
  "x-multiple"?: false;
  "x-defaultValue"?: string;
  "x-options": string[];
}

export interface FieldSelectMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.Select;
  "x-multiple"?: true;
  "x-defaultValue"?: string[];
  "x-options": string[];
}

export type ImportSchemaFieldSingle =
  | FieldText
  | FieldTextArea
  | FieldMarkdownText
  | FieldURL
  | FieldAsset
  | FieldSelect
  | FieldInteger
  | FieldNumber
  | FieldBoolean
  | FieldDate;

export type ImportSchemaFieldMulti =
  | FieldTextMulti
  | FieldTextAreaMulti
  | FieldMarkdownTextMulti
  | FieldURLMulti
  | FieldAssetMulti
  | FieldSelectMulti
  | FieldIntegerMulti
  | FieldNumberMulti
  | FieldBooleanMulti
  | FieldDateMulti;

export type ImportSchemaField = ImportSchemaFieldSingle | ImportSchemaFieldMulti;

export interface ImportSchema {
  properties: Record<string, ImportSchemaField>;
}

export abstract class ImportSchemaUtils {
  public static validateSchemaFromJSON(
    json: ImportSchema,
  ):
    | { isValid: true; data: ImportSchema }
    | { isValid: false; error: string; zodIssues: z.core.$ZodIssue[] } {
    const timer = new PerformanceTimer("validateSchemaFromJSON");

    const validation = this.IMPORT_SCHEMA_VALIDATOR.safeParse(json);

    timer.log();

    if (validation.success) {
      return { isValid: true, data: validation.data };
    } else {
      return {
        isValid: false,
        error: validation.error.message,
        zodIssues: validation.error.issues,
      };
    }
  }

  private static readonly FIELD_BASE_VALIDATOR: z.ZodType<FieldBase> = z.object({
    title: z.coerce.string(),
    description: z.string().optional(),
    "x-fieldType": z.enum(ExportSchemaFieldType),
    "x-required": z.boolean().optional(),
    "x-multiple": z.boolean().optional(),
    "x-unique": z.boolean().optional(),
  });

  private static readonly FIELD_TEXT_BASE_VALIDATOR: z.ZodType<FieldTextBase> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      "x-multiple": z.literal(false).default(false).optional(),
      "x-defaultValue": z.string().optional(),
    })
    .superRefine((values, context) => {
      const { "x-defaultValue": defaultValue, maxLength } = values;
      if (
        defaultValue !== undefined &&
        maxLength !== undefined &&
        defaultValue.length > maxLength
      ) {
        context.addIssue({
          code: "too_big",
          origin: "string",
          maximum: maxLength,
          message: t("defaultValue should be less than maxLength"),
          input: defaultValue,
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_TEXT_BASE_MULTI_VALIDATOR: z.ZodType<FieldTextBaseMulti> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      "x-multiple": z.literal(true).default(true).optional(),
      "x-defaultValue": z.string().array().optional(),
    })
    .superRefine((values, context) => {
      const { "x-defaultValue": defaultValue, maxLength } = values;
      if (
        defaultValue !== undefined &&
        maxLength !== undefined &&
        defaultValue.some(value => value.length > maxLength)
      ) {
        context.addIssue({
          code: "too_big",
          origin: "string",
          maximum: maxLength,
          message: t("each defaultValue item should be less than maxLength"),
          input: defaultValue,
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly IMPORT_SCHEMA_VALIDATOR: z.ZodType<ImportSchema> = z.object({
    properties: z.record(
      z.string(),
      z.union([
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Text),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Text),
          })
          .and(this.FIELD_TEXT_BASE_MULTI_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.TextArea),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.TextArea),
          })
          .and(this.FIELD_TEXT_BASE_MULTI_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Markdown),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Markdown),
          })
          .and(this.FIELD_TEXT_BASE_MULTI_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Asset),
            "x-multiple": z.literal(false).default(false).optional(),
            "x-defaultValue": z.string().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Asset),
            "x-multiple": z.literal(true).default(true).optional(),
            "x-defaultValue": z.string().array().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Bool),
            "x-multiple": z.literal(false).default(false).optional(),
            "x-defaultValue": z.boolean().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Bool),
            "x-multiple": z.literal(true).default(true).optional(),
            "x-defaultValue": z.boolean().array().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Datetime),
            "x-multiple": z.literal(false).default(false).optional(),
            "x-defaultValue": z.iso.datetime({ offset: true }).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Datetime),
            "x-multiple": z.literal(true).default(true).optional(),
            "x-defaultValue": z.iso.datetime({ offset: true }).array().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Number),
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            "x-defaultValue": z.number().optional(),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (minimum !== undefined && defaultValue !== undefined && defaultValue < minimum) {
              context.addIssue({
                code: "too_small",
                origin: "number",
                minimum,
                message: t("defaultValue should be greater than minimum"),
                input: defaultValue,
              });
            }

            if (maximum !== undefined && defaultValue !== undefined && defaultValue > maximum) {
              context.addIssue({
                code: "too_big",
                origin: "number",
                maximum,
                message: t("defaultValue should be less than maximum"),
                input: defaultValue,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Number),
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            "x-defaultValue": z.number().array().optional(),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (
              minimum !== undefined &&
              defaultValue !== undefined &&
              defaultValue.some(value => value < minimum)
            ) {
              context.addIssue({
                code: "too_small",
                origin: "number",
                minimum,
                message: t("each defaultValue item should be greater than minimum"),
                input: defaultValue,
              });
            }

            if (
              maximum !== undefined &&
              defaultValue !== undefined &&
              defaultValue.some(value => value > maximum)
            ) {
              context.addIssue({
                code: "too_big",
                origin: "number",
                maximum,
                message: t("each defaultValue item should be less than maximum"),
                input: defaultValue,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Integer),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            "x-defaultValue": z.int().optional(),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (minimum !== undefined && defaultValue !== undefined && defaultValue < minimum) {
              context.addIssue({
                code: "too_small",
                origin: "int",
                minimum,
                message: t("defaultValue should be greater than minimum"),
                input: defaultValue,
              });
            }

            if (maximum !== undefined && defaultValue !== undefined && defaultValue > maximum) {
              context.addIssue({
                code: "too_big",
                origin: "int",
                maximum,
                message: t("defaultValue should be less than maximum"),
                input: defaultValue,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Integer),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            "x-defaultValue": z.int().array().optional(),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (
              minimum !== undefined &&
              defaultValue !== undefined &&
              defaultValue.some(value => value < minimum)
            ) {
              context.addIssue({
                code: "too_small",
                origin: "int",
                minimum,
                message: t("each defaultValue item should be greater than minimum"),
                input: defaultValue,
              });
            }

            if (
              maximum !== undefined &&
              defaultValue !== undefined &&
              defaultValue.some(value => value > maximum)
            ) {
              context.addIssue({
                code: "too_big",
                origin: "int",
                maximum,
                message: t("each defaultValue item should be less than maximum"),
                input: defaultValue,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Select),
            "x-options": z.coerce.string().array(),
            "x-defaultValue": z.string().optional(),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .superRefine((value, context) => {
            const { "x-defaultValue": defaultValue, "x-options": options } = value;
            const valuesSet = new Set(options);
            if (defaultValue && !valuesSet.has(defaultValue)) {
              context.addIssue({
                code: "invalid_value",
                message: t("defaultValue should be in one of options"),
                input: value,
                values: options,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.Select),
            "x-options": z.string().array(),
            "x-defaultValue": z.string().array().optional(),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((value, context) => {
            const { "x-defaultValue": defaultValue, "x-options": options } = value;
            const valuesSet = new Set(options);
            if (defaultValue && defaultValue.some(_value => !valuesSet.has(_value))) {
              context.addIssue({
                code: "invalid_value",
                message: t("defaultValue should be in one of options"),
                input: value,
                values: options,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.URL),
            "x-defaultValue": z.url().optional(),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-fieldType": z.literal(ExportSchemaFieldType.URL),
            "x-defaultValue": z.url().array().optional(),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
      ]),
    ),
  });

  public static getUIMetadata(params: {
    hasSchemaCreateRight: boolean;
    hasModelFields: boolean;
    isFieldTab?: boolean;
    isModel?: boolean;
  }): {
    tooltipMessage: TooltipProps["title"];
    shouldDisable: boolean;
  } {
    const { hasModelFields, hasSchemaCreateRight, isFieldTab = true, isModel = true } = params;

    let tooltipMessage: TooltipProps["title"] = undefined;

    if (!isModel) {
      tooltipMessage = t("Importing into groups is not supported");
    } else if (!isFieldTab) {
      tooltipMessage = t("Importing into meta data is not supported");
    } else if (!hasSchemaCreateRight) {
      tooltipMessage = t("Reader cannot import schema.");
    } else if (hasModelFields) {
      tooltipMessage = t("Only empty schemas can be imported into");
    }

    return {
      tooltipMessage,
      shouldDisable: !isModel || !isFieldTab || !hasSchemaCreateRight || hasModelFields,
    };
  }
}
