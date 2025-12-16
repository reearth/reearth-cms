/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import z from "zod";

import {
  SchemaFieldType,
  SchemaFieldType as SchemaFieldTypeConst,
} from "@reearth-cms/components/molecules/Schema/types";

import { PerformanceTimer } from "./performance";

interface FieldBase2 {
  title: string;
  description: string;
  type: SchemaFieldType;
  required: boolean;
  multiple: boolean;
  unique: boolean;
}

// field common properties
interface FieldTextBase extends FieldBase2 {
  maxLength?: number;
  multiple: false;
  defaultValue?: string;
}

interface FieldTextBaseMulti extends FieldBase2 {
  maxLength?: number;
  multiple: true;
  defaultValue?: string[];
}

interface FieldNumberBase extends FieldBase2 {
  maximum?: number;
  minimum?: number;
  multiple: false;
  defaultValue?: number;
}

interface FieldNumberBaseMulti extends FieldBase2 {
  maximum?: number;
  minimum?: number;
  multiple: true;
  defaultValue?: number[];
}

// fields
interface FieldText extends FieldTextBase {
  type: "Text";
}

interface FieldTextMulti extends FieldTextBaseMulti {
  type: "Text";
}

interface FieldTextArea extends FieldTextBase {
  type: "TextArea";
}

interface FieldTextAreaMulti extends FieldTextBaseMulti {
  type: "TextArea";
}

interface FieldMarkdownText extends FieldTextBase {
  type: "MarkdownText";
}

interface FieldMarkdownTextMulti extends FieldTextBaseMulti {
  type: "MarkdownText";
}

interface FieldURL extends FieldTextBase {
  type: "URL";
}

interface FieldURLMulti extends FieldTextBaseMulti {
  type: "URL";
}

interface FieldAsset extends FieldBase2 {
  type: "Asset";
  multiple: false;
  defaultValue?: string;
}

interface FieldAssetMulti extends FieldBase2 {
  type: "Asset";
  multiple: true;
  defaultValue?: string[];
}

interface FieldInteger extends FieldNumberBase {
  type: "Integer";
}

interface FieldIntegerMulti extends FieldNumberBaseMulti {
  type: "Integer";
}

interface FieldNumber extends FieldNumberBase {
  type: "Number";
}

interface FieldNumberMulti extends FieldNumberBaseMulti {
  type: "Number";
}

interface FieldBoolean extends FieldBase2 {
  type: "Bool";
  multiple: false;
  defaultValue?: boolean;
}

interface FieldBooleanMulti extends FieldBase2 {
  type: "Bool";
  multiple: true;
  defaultValue?: boolean[];
}

interface FieldDate extends FieldBase2 {
  type: "Date";
  multiple: false;
  defaultValue?: string;
}

interface FieldDateMulti extends FieldBase2 {
  type: "Date";
  multiple: true;
  defaultValue?: string[];
}

interface FieldSelect extends FieldBase2 {
  type: "Select";
  multiple: false;
  defaultValue?: string;
  values: string[];
}

interface FieldSelectMulti extends FieldBase2 {
  type: "Select";
  multiple: true;
  defaultValue?: string[];
  values: string[];
}

export type ImportSchemaField2 =
  | FieldText
  | FieldTextMulti
  | FieldTextArea
  | FieldTextAreaMulti
  | FieldMarkdownText
  | FieldMarkdownTextMulti
  | FieldURL
  | FieldURLMulti
  | FieldAsset
  | FieldAssetMulti
  | FieldSelect
  | FieldSelectMulti
  | FieldInteger
  | FieldIntegerMulti
  | FieldNumber
  | FieldNumberMulti
  | FieldBoolean
  | FieldBooleanMulti
  | FieldDate
  | FieldDateMulti;

export interface ImportSchema2 {
  properties: Record<string, ImportSchemaField2>;
}

export abstract class ImportSchemaUtils {
  public static validateSchemaFromJSON(
    json: Record<string, unknown>,
  ): { isValid: true; data: ImportSchema2 } | { isValid: false; error: string } {
    const timer = new PerformanceTimer("validateSchemaFromJSON");

    const validation = this.IMPORT_SCHEMA_VALIDATOR.safeParse(json);

    timer.log();

    if (validation.success) {
      return { isValid: true, data: validation.data };
    } else {
      return { isValid: false, error: validation.error.message };
    }
  }

  private static readonly FIELD_BASE_VALIDATOR: z.ZodType<FieldBase2> = z.object({
    title: z.string(),
    description: z.string(),
    type: z.union(Object.values(SchemaFieldTypeConst).map(value => z.literal(value))),
    required: z.boolean(),
    multiple: z.boolean(),
    unique: z.boolean(),
  });

  private static readonly FIELD_TEXT_BASE_VALIDATOR: z.ZodType<FieldTextBase> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      multiple: z.literal(false),
      defaultValue: z.string().optional(),
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_TEXT_BASE_MULTI_VALIDATOR: z.ZodType<FieldTextBaseMulti> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      multiple: z.literal(true),
      defaultValue: z.string().array().optional(),
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly IMPORT_SCHEMA_VALIDATOR: z.ZodType<ImportSchema2> = z.object({
    properties: z.record(
      z.string(),
      z.union([
        z
          .object({
            type: z.literal(SchemaFieldType.Text),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Text),
          })
          .and(this.FIELD_TEXT_BASE_MULTI_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.TextArea),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.TextArea),
          })
          .and(this.FIELD_TEXT_BASE_MULTI_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.MarkdownText),
          })
          .and(this.FIELD_TEXT_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.MarkdownText),
          })
          .and(this.FIELD_TEXT_BASE_MULTI_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Asset),
            multiple: z.literal(false),
            defaultValue: z.string().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Asset),
            multiple: z.literal(true),
            defaultValue: z.string().array().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Bool),
            multiple: z.literal(false),
            defaultValue: z.boolean().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Bool),
            multiple: z.literal(true),
            defaultValue: z.boolean().array().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Date),
            multiple: z.literal(false),
            defaultValue: z.string().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Date),
            multiple: z.literal(true),
            defaultValue: z.string().array().optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Number),
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            defaultValue: z.number().optional(),
            multiple: z.literal(false),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Number),
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            defaultValue: z.number().array().optional(),
            multiple: z.literal(true),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Integer),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            defaultValue: z.int().optional(),
            multiple: z.literal(false),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Integer),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            defaultValue: z.int().array().optional(),
            multiple: z.literal(true),
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
            type: z.literal(SchemaFieldType.Select),
            values: z.string().array(),
            defaultValue: z.string().optional(),
            multiple: z.literal(false),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Select),
            values: z.string().array(),
            defaultValue: z.string().array().optional(),
            multiple: z.literal(true),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.URL),
            defaultValue: z.url().optional(),
            multiple: z.literal(false),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.URL),
            defaultValue: z.url().array().optional(),
            multiple: z.literal(true),
          })
          .and(this.FIELD_BASE_VALIDATOR),
      ]),
    ),
  });
}
