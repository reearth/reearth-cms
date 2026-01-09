/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { GeoJSONPoint } from "ol/format/GeoJSON";
import z from "zod";
import {
  GeoJSONGeometryCollection,
  GeoJSONGeometryCollectionSchema,
  GeoJSONLineString,
  GeoJSONLineStringSchema,
  GeoJSONMultiLineString,
  GeoJSONMultiLineStringSchema,
  GeoJSONMultiPoint,
  GeoJSONMultiPointSchema,
  GeoJSONMultiPolygon,
  GeoJSONMultiPolygonSchema,
  GeoJSONPointSchema,
  GeoJSONPolygon,
  GeoJSONPolygonSchema,
} from "zod-geojson";

import {
  ObjectSupportedType,
  EditorSupportedType,
  SchemaFieldType,
  SchemaFieldType as SchemaFieldTypeConst,
} from "@reearth-cms/components/molecules/Schema/types";

import { PerformanceTimer } from "./performance";

interface FieldBase {
  title: string;
  description: string;
  type: SchemaFieldType;
  required: boolean;
  multiple: boolean;
  unique: boolean;
}

// text common
interface FieldTextBase extends FieldBase {
  maxLength?: number;
  multiple: false;
  defaultValue?: string;
}

interface FieldTextBaseMulti extends FieldBase {
  maxLength?: number;
  multiple: true;
  defaultValue?: string[];
}

// number common
interface FieldNumberBase extends FieldBase {
  maximum?: number;
  minimum?: number;
  multiple: false;
  defaultValue?: number;
}

interface FieldNumberBaseMulti extends FieldBase {
  maximum?: number;
  minimum?: number;
  multiple: true;
  defaultValue?: number[];
}

// geo editor common
interface FieldGeoEditorBase extends FieldBase {
  type: "GeometryEditor";
  multiple: false;
  supportType: EditorSupportedType;
}

interface FieldGeoEditorBaseMulti extends FieldBase {
  type: "GeometryEditor";
  multiple: true;
  supportType: EditorSupportedType;
}

// Mapping from ObjectSupportedType to GeoJSON geometry types
type GeoJSONTypeMap = {
  POINT: GeoJSONPoint;
  MULTIPOINT: GeoJSONMultiPoint;
  LINESTRING: GeoJSONLineString;
  MULTILINESTRING: GeoJSONMultiLineString;
  POLYGON: GeoJSONPolygon;
  MULTIPOLYGON: GeoJSONMultiPolygon;
  GEOMETRYCOLLECTION: GeoJSONGeometryCollection;
};

// Helper type to convert array of types to union of corresponding GeoJSON types
type SupportTypeToGeoJSON<T extends readonly ObjectSupportedType[]> = T[number] extends infer U
  ? U extends ObjectSupportedType
    ? GeoJSONTypeMap[U]
    : never
  : never;

// fields
export interface FieldText extends FieldTextBase {
  type: "Text";
}

export interface FieldTextMulti extends FieldTextBaseMulti {
  type: "Text";
}

export interface FieldTextArea extends FieldTextBase {
  type: "TextArea";
}

export interface FieldTextAreaMulti extends FieldTextBaseMulti {
  type: "TextArea";
}

export interface FieldMarkdownText extends FieldTextBase {
  type: "MarkdownText";
}

export interface FieldMarkdownTextMulti extends FieldTextBaseMulti {
  type: "MarkdownText";
}

export interface FieldURL extends FieldBase {
  type: "URL";
  multiple: false;
  defaultValue?: string;
}

export interface FieldURLMulti extends FieldBase {
  type: "URL";
  multiple: true;
  defaultValue?: string[];
}

export interface FieldAsset extends FieldBase {
  type: "Asset";
  multiple: false;
  defaultValue?: string;
}

export interface FieldAssetMulti extends FieldBase {
  type: "Asset";
  multiple: true;
  defaultValue?: string[];
}

export interface FieldInteger extends FieldNumberBase {
  type: "Integer";
}

export interface FieldIntegerMulti extends FieldNumberBaseMulti {
  type: "Integer";
}

export interface FieldNumber extends FieldNumberBase {
  type: "Number";
}

export interface FieldNumberMulti extends FieldNumberBaseMulti {
  type: "Number";
}

export interface FieldBoolean extends FieldBase {
  type: "Bool";
  multiple: false;
  defaultValue?: boolean;
}

export interface FieldBooleanMulti extends FieldBase {
  type: "Bool";
  multiple: true;
  defaultValue?: boolean[];
}

export interface FieldDate extends FieldBase {
  type: "Date";
  multiple: false;
  defaultValue?: string;
}

export interface FieldDateMulti extends FieldBase {
  type: "Date";
  multiple: true;
  defaultValue?: string[];
}

export interface FieldSelect extends FieldBase {
  type: "Select";
  multiple: false;
  defaultValue?: string;
  values: string[];
}

export interface FieldSelectMulti extends FieldBase {
  type: "Select";
  multiple: true;
  defaultValue?: string[];
  values: string[];
}

export interface FieldGeoObject<S extends readonly ObjectSupportedType[] = ObjectSupportedType[]>
  extends FieldBase {
  type: "GeometryObject";
  multiple: false;
  supportType: S;
  defaultValue?: SupportTypeToGeoJSON<S>;
}

export interface FieldGeoObjectMulti<S extends ObjectSupportedType[] = ObjectSupportedType[]>
  extends FieldBase {
  type: "GeometryObject";
  multiple: true;
  supportType: S;
  defaultValue?: SupportTypeToGeoJSON<S>[];
}

interface FieldGeoEditorPoint extends FieldGeoEditorBase {
  defaultValue?: GeoJSONPoint;
}

interface FieldGeoEditorLineString extends FieldGeoEditorBase {
  defaultValue?: GeoJSONLineString;
}

interface FieldGeoEditorPolygon extends FieldGeoEditorBase {
  defaultValue?: GeoJSONPolygon;
}

interface FieldGeoEditorAny extends FieldGeoEditorBase {
  defaultValue?: GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon;
}

interface FieldGeoEditorPointMulti extends FieldGeoEditorBaseMulti {
  defaultValue?: GeoJSONPoint[];
}

interface FieldGeoEditorLineStringMulti extends FieldGeoEditorBaseMulti {
  defaultValue?: GeoJSONLineString[];
}

interface FieldGeoEditorPolygonMulti extends FieldGeoEditorBaseMulti {
  defaultValue?: GeoJSONPolygon[];
}

interface FieldGeoEditorAnyMulti extends FieldGeoEditorBaseMulti {
  defaultValue?: (GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon)[];
}

// geo editor single
export type FieldGeoEditor =
  | FieldGeoEditorPoint
  | FieldGeoEditorLineString
  | FieldGeoEditorPolygon
  | FieldGeoEditorAny;

// geo editor multiple
export type FieldGeoEditorMulti =
  | FieldGeoEditorPointMulti
  | FieldGeoEditorLineStringMulti
  | FieldGeoEditorPolygonMulti
  | FieldGeoEditorAnyMulti;

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
  | FieldDate
  | FieldGeoObject
  | FieldGeoEditor;

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
  | FieldDateMulti
  | FieldGeoObjectMulti
  | FieldGeoEditorMulti;

export type ImportSchemaField = ImportSchemaFieldSingle | ImportSchemaFieldMulti;

export interface ImportSchema {
  properties: Record<string, ImportSchemaField>;
}

export abstract class ImportSchemaUtils {
  public static validateSchemaFromJSON(
    json: ImportSchema,
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

  private static readonly FIELD_BASE_VALIDATOR: z.ZodType<FieldBase> = z.object({
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
    .superRefine((values, context) => {
      const { defaultValue, maxLength } = values;
      if (defaultValue && maxLength && defaultValue.length > maxLength) {
        context.addIssue({
          code: "too_big",
          origin: "string",
          maximum: maxLength,
          message: "defaultValue should be less than maxLength",
          input: defaultValue,
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_TEXT_BASE_MULTI_VALIDATOR: z.ZodType<FieldTextBaseMulti> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      multiple: z.literal(true),
      defaultValue: z.string().array().optional(),
    })
    .superRefine((values, context) => {
      const { defaultValue, maxLength } = values;
      if (defaultValue && maxLength && defaultValue.some(value => value.length > maxLength)) {
        context.addIssue({
          code: "too_big",
          origin: "string",
          maximum: maxLength,
          message: "each defaultValue item should be less than maxLength",
          input: defaultValue,
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_GEO_OBJECT_VALIDATOR: z.ZodType<FieldGeoObject> = z
    .object({
      type: z.literal("GeometryObject"),
      multiple: z.literal(false),
      supportType: z
        .union([
          z.literal("POINT"),
          z.literal("MULTIPOINT"),
          z.literal("LINESTRING"),
          z.literal("MULTILINESTRING"),
          z.literal("POLYGON"),
          z.literal("MULTIPOLYGON"),
          z.literal("GEOMETRYCOLLECTION"),
        ])
        .array(),
      defaultValue: z
        .union([
          GeoJSONPointSchema,
          GeoJSONMultiPointSchema,
          GeoJSONLineStringSchema,
          GeoJSONMultiLineStringSchema,
          GeoJSONPolygonSchema,
          GeoJSONMultiPolygonSchema,
          GeoJSONGeometryCollectionSchema,
        ])
        .optional(),
    })
    .superRefine((values, context) => {
      const { supportType, defaultValue } = values;

      if (!defaultValue) return;

      const supportTypeSet = new Set<Lowercase<ObjectSupportedType>>(
        supportType.map(type => type.toLowerCase() as Lowercase<ObjectSupportedType>),
      );

      const defaultValueType =
        defaultValue.type.toLocaleLowerCase() as Lowercase<ObjectSupportedType>;

      if (!supportTypeSet.has(defaultValueType)) {
        context.addIssue({
          code: "custom",
          expected:
            "Legal support types: POINT, MULTIPOINT, LINESTRING, MULTILINESTRING, POLYGON, MULTIPOLYGON, GEOMETRYCOLLECTION",
          message: "defaultValue type is invalid",
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_GEO_OBJECT_MULTI_VALIDATOR: z.ZodType<FieldGeoObjectMulti> = z
    .object({
      type: z.literal("GeometryObject"),
      multiple: z.literal(true),
      supportType: z
        .union([
          z.literal("POINT"),
          z.literal("MULTIPOINT"),
          z.literal("LINESTRING"),
          z.literal("MULTILINESTRING"),
          z.literal("POLYGON"),
          z.literal("MULTIPOLYGON"),
          z.literal("GEOMETRYCOLLECTION"),
        ])
        .array(),
      defaultValue: z
        .union([
          GeoJSONPointSchema,
          GeoJSONMultiPointSchema,
          GeoJSONLineStringSchema,
          GeoJSONMultiLineStringSchema,
          GeoJSONPolygonSchema,
          GeoJSONMultiPolygonSchema,
          GeoJSONGeometryCollectionSchema,
        ])
        .array()
        .optional(),
    })
    .superRefine((values, context) => {
      const { supportType, defaultValue } = values;

      if (!defaultValue) return;

      const supportTypeSet = new Set<Lowercase<ObjectSupportedType>>(
        supportType.map(type => type.toLowerCase() as Lowercase<ObjectSupportedType>),
      );

      const defaultValueTypes = defaultValue.map(_defaultValue =>
        _defaultValue.type.toLocaleLowerCase(),
      ) as Lowercase<ObjectSupportedType>[];

      if (defaultValueTypes.some(defaultValueType => !supportTypeSet.has(defaultValueType))) {
        context.addIssue({
          code: "custom",
          expected:
            "Legal support types: POINT, MULTIPOINT, LINESTRING, MULTILINESTRING, POLYGON, MULTIPOLYGON, GEOMETRYCOLLECTION",
          message: "defaultValue type is invalid",
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FILED_GEO_EDITOR_VALIDATOR: z.ZodType<FieldGeoEditor> = z.union([
    z
      .object({
        type: z.literal("GeometryEditor"),
        multiple: z.literal(false),
        supportType: z.literal("POINT"),
        defaultValue: GeoJSONPointSchema.optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        type: z.literal("GeometryEditor"),
        multiple: z.literal(false),
        supportType: z.literal("LINESTRING"),
        defaultValue: GeoJSONLineStringSchema.optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        type: z.literal("GeometryEditor"),
        multiple: z.literal(false),
        supportType: z.literal("POLYGON"),
        defaultValue: GeoJSONPolygonSchema.optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        type: z.literal("GeometryEditor"),
        multiple: z.literal(false),
        supportType: z.literal("ANY"),
        defaultValue: z
          .union([GeoJSONPointSchema, GeoJSONLineStringSchema, GeoJSONPolygonSchema])
          .optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
  ]);

  private static readonly FILED_GEO_EDITOR_MULTI_VALIDATOR: z.ZodType<FieldGeoEditorMulti> =
    z.union([
      z
        .object({
          type: z.literal("GeometryEditor"),
          multiple: z.literal(true),
          supportType: z.literal("POINT"),
          defaultValue: GeoJSONPointSchema.array().optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          type: z.literal("GeometryEditor"),
          multiple: z.literal(true),
          supportType: z.literal("LINESTRING"),
          defaultValue: GeoJSONLineStringSchema.array().optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          type: z.literal("GeometryEditor"),
          multiple: z.literal(true),
          supportType: z.literal("POLYGON"),
          defaultValue: GeoJSONPolygonSchema.array().optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          type: z.literal("GeometryEditor"),
          multiple: z.literal(true),
          supportType: z.literal("ANY"),
          defaultValue: z
            .union([GeoJSONPointSchema, GeoJSONLineStringSchema, GeoJSONPolygonSchema])
            .array()
            .optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
    ]);

  private static readonly IMPORT_SCHEMA_VALIDATOR: z.ZodType<ImportSchema> = z.object({
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
            defaultValue: z.iso.datetime({ offset: true }).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Date),
            multiple: z.literal(true),
            defaultValue: z.iso.datetime({ offset: true }).array().optional(),
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
          .superRefine((values, context) => {
            const { maximum, minimum, defaultValue } = values;

            if (minimum && defaultValue && defaultValue < minimum) {
              context.addIssue({
                code: "too_small",
                origin: "number",
                minimum,
                message: "defaultValue should be greater than minimum",
                input: defaultValue,
              });
            }

            if (maximum && defaultValue && defaultValue > maximum) {
              context.addIssue({
                code: "too_big",
                origin: "number",
                maximum,
                message: "defaultValue should be less than maximum",
                input: defaultValue,
              });
            }
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
          .superRefine((values, context) => {
            const { maximum, minimum, defaultValue } = values;

            if (minimum && defaultValue && defaultValue.some(value => value < minimum)) {
              context.addIssue({
                code: "too_small",
                origin: "number",
                minimum,
                message: "each defaultValue item should be greater than minimum",
                input: defaultValue,
              });
            }

            if (maximum && defaultValue && defaultValue.some(value => value > maximum)) {
              context.addIssue({
                code: "too_big",
                origin: "number",
                maximum,
                message: "each defaultValue item should be less than maximum",
                input: defaultValue,
              });
            }
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
          .superRefine((values, context) => {
            const { maximum, minimum, defaultValue } = values;

            if (minimum && defaultValue && defaultValue < minimum) {
              context.addIssue({
                code: "too_small",
                origin: "int",
                minimum,
                message: "defaultValue should be greater than minimum",
                input: defaultValue,
              });
            }

            if (maximum && defaultValue && defaultValue > maximum) {
              context.addIssue({
                code: "too_big",
                origin: "int",
                maximum,
                message: "defaultValue should be less than maximum",
                input: defaultValue,
              });
            }
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
          .superRefine((values, context) => {
            const { maximum, minimum, defaultValue } = values;

            if (minimum && defaultValue && defaultValue.some(value => value < minimum)) {
              context.addIssue({
                code: "too_small",
                origin: "int",
                minimum,
                message: "each defaultValue item should be greater than minimum",
                input: defaultValue,
              });
            }

            if (maximum && defaultValue && defaultValue.some(value => value > maximum)) {
              context.addIssue({
                code: "too_big",
                origin: "int",
                maximum,
                message: "each defaultValue item should be less than maximum",
                input: defaultValue,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Select),
            values: z.string().array(),
            defaultValue: z.string().optional(),
            multiple: z.literal(false),
          })
          .superRefine((value, context) => {
            const { defaultValue, values } = value;
            const valuesSet = new Set(values);
            if (defaultValue && !valuesSet.has(defaultValue)) {
              context.addIssue({
                code: "invalid_value",
                message: "defaultValue should be in one of values",
                input: value,
                values,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            type: z.literal(SchemaFieldType.Select),
            values: z.string().array(),
            defaultValue: z.string().array().optional(),
            multiple: z.literal(true),
          })
          .superRefine((value, context) => {
            const { defaultValue, values } = value;
            const valuesSet = new Set(values);
            if (defaultValue && defaultValue.some(_value => !valuesSet.has(_value))) {
              context.addIssue({
                code: "invalid_value",
                message: "defaultValue should be in one of values",
                input: value,
                values,
              });
            }
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
        this.FIELD_GEO_OBJECT_VALIDATOR,
        this.FIELD_GEO_OBJECT_MULTI_VALIDATOR,
        this.FILED_GEO_EDITOR_VALIDATOR,
        this.FILED_GEO_EDITOR_MULTI_VALIDATOR,
      ]),
    ),
  });
}
