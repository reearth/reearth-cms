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
  EditorSupportedType,
  ExportSchemaFieldType,
  ObjectSupportedType,
} from "@reearth-cms/components/molecules/Schema/types";
import { t } from "@reearth-cms/i18n";

import { PerformanceTimer } from "./performance";

interface FieldBase {
  description?: string;
  title: string;
  "x-fieldType": ExportSchemaFieldType;
  "x-multiple"?: boolean;
  "x-required"?: boolean;
  "x-unique"?: boolean;
}

// text common
interface FieldTextBase extends FieldBase {
  maxLength?: number;
  "x-defaultValue"?: string;
  "x-multiple"?: false;
}

interface FieldTextBaseMulti extends FieldBase {
  maxLength?: number;
  "x-defaultValue"?: string[];
  "x-multiple"?: true;
}

// number common
interface FieldNumberBase extends FieldBase {
  maximum?: number;
  minimum?: number;
  "x-defaultValue"?: number;
  "x-multiple"?: false;
}

interface FieldNumberBaseMulti extends FieldBase {
  maximum?: number;
  minimum?: number;
  "x-defaultValue"?: number[];
  "x-multiple"?: true;
}

// geo editor common
interface FieldGeoEditorBase extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.GeometryEditor;
  "x-geoSupportedType": EditorSupportedType;
  "x-multiple"?: false;
}

interface FieldGeoEditorBaseMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.GeometryEditor;
  "x-geoSupportedType": EditorSupportedType;
  "x-multiple"?: true;
}

// Mapping from ObjectSupportedType to GeoJSON geometry types
type GeoJSONTypeMap = {
  GEOMETRYCOLLECTION: GeoJSONGeometryCollection;
  LINESTRING: GeoJSONLineString;
  MULTILINESTRING: GeoJSONMultiLineString;
  MULTIPOINT: GeoJSONMultiPoint;
  MULTIPOLYGON: GeoJSONMultiPolygon;
  POINT: GeoJSONPoint;
  POLYGON: GeoJSONPolygon;
};

// Helper type to convert array of types to union of corresponding GeoJSON types
type SupportTypeToGeoJSON<T extends readonly ObjectSupportedType[]> = T[number] extends infer U
  ? U extends ObjectSupportedType
    ? GeoJSONTypeMap[U]
    : never
  : never;

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
  "x-defaultValue"?: string;
  "x-fieldType": ExportSchemaFieldType.URL;
  "x-multiple"?: false;
}

export interface FieldURLMulti extends FieldBase {
  "x-defaultValue"?: string[];
  "x-fieldType": ExportSchemaFieldType.URL;
  "x-multiple"?: true;
}

export interface FieldAsset extends FieldBase {
  "x-defaultValue"?: string;
  "x-fieldType": ExportSchemaFieldType.Asset;
  "x-multiple"?: false;
}

export interface FieldAssetMulti extends FieldBase {
  "x-defaultValue"?: string[];
  "x-fieldType": ExportSchemaFieldType.Asset;
  "x-multiple"?: true;
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
  "x-defaultValue"?: boolean;
  "x-fieldType": ExportSchemaFieldType.Bool;
  "x-multiple"?: false;
}

export interface FieldBooleanMulti extends FieldBase {
  "x-defaultValue"?: boolean[];
  "x-fieldType": ExportSchemaFieldType.Bool;
  "x-multiple"?: true;
}

export interface FieldDate extends FieldBase {
  "x-defaultValue"?: string;
  "x-fieldType": ExportSchemaFieldType.Datetime;
  "x-multiple"?: false;
}

export interface FieldDateMulti extends FieldBase {
  "x-defaultValue"?: string[];
  "x-fieldType": ExportSchemaFieldType.Datetime;
  "x-multiple"?: true;
}

export interface FieldSelect extends FieldBase {
  "x-defaultValue"?: string;
  "x-fieldType": ExportSchemaFieldType.Select;
  "x-multiple"?: false;
  "x-options": string[];
}

export interface FieldSelectMulti extends FieldBase {
  "x-defaultValue"?: string[];
  "x-fieldType": ExportSchemaFieldType.Select;
  "x-multiple"?: true;
  "x-options": string[];
}

export interface FieldGeoObject<
  S extends readonly ObjectSupportedType[] = ObjectSupportedType[],
> extends FieldBase {
  "x-defaultValue"?: SupportTypeToGeoJSON<S>;
  "x-fieldType": ExportSchemaFieldType.GeometryObject;
  "x-geoSupportedTypes": S;
  "x-multiple"?: false;
}

export interface FieldGeoObjectMulti<
  S extends ObjectSupportedType[] = ObjectSupportedType[],
> extends FieldBase {
  "x-defaultValue"?: SupportTypeToGeoJSON<S>[];
  "x-fieldType": ExportSchemaFieldType.GeometryObject;
  "x-geoSupportedTypes": S;
  "x-multiple"?: true;
}

interface FieldGeoEditorPoint extends FieldGeoEditorBase {
  "x-defaultValue"?: GeoJSONPoint;
}

interface FieldGeoEditorLineString extends FieldGeoEditorBase {
  "x-defaultValue"?: GeoJSONLineString;
}

interface FieldGeoEditorPolygon extends FieldGeoEditorBase {
  "x-defaultValue"?: GeoJSONPolygon;
}

interface FieldGeoEditorAny extends FieldGeoEditorBase {
  "x-defaultValue"?: GeoJSONLineString | GeoJSONPoint | GeoJSONPolygon;
}

interface FieldGeoEditorPointMulti extends FieldGeoEditorBaseMulti {
  "x-defaultValue"?: GeoJSONPoint[];
}

interface FieldGeoEditorLineStringMulti extends FieldGeoEditorBaseMulti {
  "x-defaultValue"?: GeoJSONLineString[];
}

interface FieldGeoEditorPolygonMulti extends FieldGeoEditorBaseMulti {
  "x-defaultValue"?: GeoJSONPolygon[];
}

interface FieldGeoEditorAnyMulti extends FieldGeoEditorBaseMulti {
  "x-defaultValue"?: (GeoJSONLineString | GeoJSONPoint | GeoJSONPolygon)[];
}

// geo editor single
export type FieldGeoEditor =
  | FieldGeoEditorAny
  | FieldGeoEditorLineString
  | FieldGeoEditorPoint
  | FieldGeoEditorPolygon;

// geo editor multiple
export type FieldGeoEditorMulti =
  | FieldGeoEditorAnyMulti
  | FieldGeoEditorLineStringMulti
  | FieldGeoEditorPointMulti
  | FieldGeoEditorPolygonMulti;

export type ImportSchemaFieldSingle =
  | FieldAsset
  | FieldBoolean
  | FieldDate
  | FieldGeoEditor
  | FieldGeoObject
  | FieldInteger
  | FieldMarkdownText
  | FieldNumber
  | FieldSelect
  | FieldText
  | FieldTextArea
  | FieldURL;

export type ImportSchemaFieldMulti =
  | FieldAssetMulti
  | FieldBooleanMulti
  | FieldDateMulti
  | FieldGeoEditorMulti
  | FieldGeoObjectMulti
  | FieldIntegerMulti
  | FieldMarkdownTextMulti
  | FieldNumberMulti
  | FieldSelectMulti
  | FieldTextAreaMulti
  | FieldTextMulti
  | FieldURLMulti;

export type ImportSchemaField = ImportSchemaFieldMulti | ImportSchemaFieldSingle;

export interface ImportSchema {
  properties: Record<string, ImportSchemaField>;
}

export abstract class ImportSchemaUtils {
  public static validateSchemaFromJSON(
    json: ImportSchema,
  ): { data: ImportSchema; isValid: true } | { error: string; isValid: false } {
    const timer = new PerformanceTimer("validateSchemaFromJSON");

    const validation = this.IMPORT_SCHEMA_VALIDATOR.safeParse(json);

    timer.log();

    if (validation.success) {
      return { data: validation.data, isValid: true };
    } else {
      return { error: validation.error.message, isValid: false };
    }
  }

  private static readonly FIELD_BASE_VALIDATOR: z.ZodType<FieldBase> = z.object({
    description: z.string().optional(),
    title: z.coerce.string(),
    "x-fieldType": z.enum(ExportSchemaFieldType),
    "x-multiple": z.boolean().optional(),
    "x-required": z.boolean().optional(),
    "x-unique": z.boolean().optional(),
  });

  private static readonly FIELD_TEXT_BASE_VALIDATOR: z.ZodType<FieldTextBase> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      "x-defaultValue": z.string().optional(),
      "x-multiple": z.literal(false).default(false).optional(),
    })
    .superRefine((values, context) => {
      const { maxLength, "x-defaultValue": defaultValue } = values;
      if (defaultValue && maxLength && defaultValue.length > maxLength) {
        context.addIssue({
          code: "too_big",
          input: defaultValue,
          maximum: maxLength,
          message: "defaultValue should be less than maxLength",
          origin: "string",
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_TEXT_BASE_MULTI_VALIDATOR: z.ZodType<FieldTextBaseMulti> = z
    .object({
      maxLength: z.int().nonnegative().optional(),
      "x-defaultValue": z.string().array().optional(),
      "x-multiple": z.literal(true).default(true).optional(),
    })
    .superRefine((values, context) => {
      const { maxLength, "x-defaultValue": defaultValue } = values;
      if (defaultValue && maxLength && defaultValue.some(value => value.length > maxLength)) {
        context.addIssue({
          code: "too_big",
          input: defaultValue,
          maximum: maxLength,
          message: "each defaultValue item should be less than maxLength",
          origin: "string",
        });
      }
    })
    .and(this.FIELD_BASE_VALIDATOR);

  private static readonly FIELD_GEO_OBJECT_VALIDATOR: z.ZodType<FieldGeoObject> = z
    .object({
      "x-defaultValue": z
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
      "x-fieldType": z.literal(ExportSchemaFieldType.GeometryObject),
      "x-geoSupportedTypes": z
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
      "x-multiple": z.literal(false).default(false).optional(),
    })
    .superRefine((values, context) => {
      const { "x-defaultValue": defaultValue, "x-geoSupportedTypes": geoSupportedTypes } = values;

      if (!defaultValue) return;

      const geoSupportTypeSet = new Set<Lowercase<ObjectSupportedType>>(
        geoSupportedTypes.map(type => type.toLowerCase() as Lowercase<ObjectSupportedType>),
      );

      const defaultValueType =
        defaultValue.type.toLocaleLowerCase() as Lowercase<ObjectSupportedType>;

      if (!geoSupportTypeSet.has(defaultValueType)) {
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
      "x-defaultValue": z
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
      "x-fieldType": z.literal(ExportSchemaFieldType.GeometryObject),
      "x-geoSupportedTypes": z
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
      "x-multiple": z.literal(true).default(true).optional(),
    })
    .superRefine((values, context) => {
      const { "x-defaultValue": defaultValue, "x-geoSupportedTypes": geoSupportedTypes } = values;

      if (!defaultValue) return;

      const supportTypeSet = new Set<Lowercase<ObjectSupportedType>>(
        geoSupportedTypes.map(type => type.toLowerCase() as Lowercase<ObjectSupportedType>),
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
        "x-defaultValue": GeoJSONPointSchema.optional(),
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-geoSupportedType": z.literal("POINT"),
        "x-multiple": z.literal(false).default(false).optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        "x-defaultValue": GeoJSONLineStringSchema.optional(),
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-geoSupportedType": z.literal("LINESTRING"),
        "x-multiple": z.literal(false).default(false).optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        "x-defaultValue": GeoJSONPolygonSchema.optional(),
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-geoSupportedType": z.literal("POLYGON"),
        "x-multiple": z.literal(false).default(false).optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        "x-defaultValue": z
          .union([GeoJSONPointSchema, GeoJSONLineStringSchema, GeoJSONPolygonSchema])
          .optional(),
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-geoSupportedType": z.literal("ANY"),
        "x-multiple": z.literal(false).default(false).optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
  ]);

  private static readonly FILED_GEO_EDITOR_MULTI_VALIDATOR: z.ZodType<FieldGeoEditorMulti> =
    z.union([
      z
        .object({
          "x-defaultValue": GeoJSONPointSchema.array().optional(),
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-geoSupportedType": z.literal("POINT"),
          "x-multiple": z.literal(true).default(true).optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          "x-defaultValue": GeoJSONLineStringSchema.array().optional(),
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-geoSupportedType": z.literal("LINESTRING"),
          "x-multiple": z.literal(true).default(true).optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          "x-defaultValue": GeoJSONPolygonSchema.array().optional(),
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-geoSupportedType": z.literal("POLYGON"),
          "x-multiple": z.literal(true).default(true).optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          "x-defaultValue": z
            .union([GeoJSONPointSchema, GeoJSONLineStringSchema, GeoJSONPolygonSchema])
            .array()
            .optional(),
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-geoSupportedType": z.literal("ANY"),
          "x-multiple": z.literal(true).default(true).optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
    ]);

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
            "x-defaultValue": z.string().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Asset),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.string().array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Asset),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.boolean().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Bool),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.boolean().array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Bool),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.iso.datetime({ offset: true }).optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Datetime),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.iso.datetime({ offset: true }).array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Datetime),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            "x-defaultValue": z.number().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Number),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (minimum && defaultValue && defaultValue < minimum) {
              context.addIssue({
                code: "too_small",
                input: defaultValue,
                message: "defaultValue should be greater than minimum",
                minimum,
                origin: "number",
              });
            }

            if (maximum && defaultValue && defaultValue > maximum) {
              context.addIssue({
                code: "too_big",
                input: defaultValue,
                maximum,
                message: "defaultValue should be less than maximum",
                origin: "number",
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            "x-defaultValue": z.number().array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Number),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (minimum && defaultValue && defaultValue.some(value => value < minimum)) {
              context.addIssue({
                code: "too_small",
                input: defaultValue,
                message: "each defaultValue item should be greater than minimum",
                minimum,
                origin: "number",
              });
            }

            if (maximum && defaultValue && defaultValue.some(value => value > maximum)) {
              context.addIssue({
                code: "too_big",
                input: defaultValue,
                maximum,
                message: "each defaultValue item should be less than maximum",
                origin: "number",
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            "x-defaultValue": z.int().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Integer),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (minimum && defaultValue && defaultValue < minimum) {
              context.addIssue({
                code: "too_small",
                input: defaultValue,
                message: "defaultValue should be greater than minimum",
                minimum,
                origin: "int",
              });
            }

            if (maximum && defaultValue && defaultValue > maximum) {
              context.addIssue({
                code: "too_big",
                input: defaultValue,
                maximum,
                message: "defaultValue should be less than maximum",
                origin: "int",
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            "x-defaultValue": z.int().array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Integer),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

            if (minimum && defaultValue && defaultValue.some(value => value < minimum)) {
              context.addIssue({
                code: "too_small",
                input: defaultValue,
                message: "each defaultValue item should be greater than minimum",
                minimum,
                origin: "int",
              });
            }

            if (maximum && defaultValue && defaultValue.some(value => value > maximum)) {
              context.addIssue({
                code: "too_big",
                input: defaultValue,
                maximum,
                message: "each defaultValue item should be less than maximum",
                origin: "int",
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.string().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Select),
            "x-multiple": z.literal(false).default(false).optional(),
            "x-options": z.coerce.string().array(),
          })
          .superRefine((value, context) => {
            const { "x-defaultValue": defaultValue, "x-options": options } = value;
            const valuesSet = new Set(options);
            if (defaultValue && !valuesSet.has(defaultValue)) {
              context.addIssue({
                code: "invalid_value",
                input: value,
                message: "defaultValue should be in one of values",
                values: options,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.string().array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.Select),
            "x-multiple": z.literal(true).default(true).optional(),
            "x-options": z.string().array(),
          })
          .superRefine((value, context) => {
            const { "x-defaultValue": defaultValue, "x-options": options } = value;
            const valuesSet = new Set(options);
            if (defaultValue && defaultValue.some(_value => !valuesSet.has(_value))) {
              context.addIssue({
                code: "invalid_value",
                input: value,
                message: "defaultValue should be in one of values",
                values: options,
              });
            }
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.url().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.URL),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        z
          .object({
            "x-defaultValue": z.url().array().optional(),
            "x-fieldType": z.literal(ExportSchemaFieldType.URL),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .and(this.FIELD_BASE_VALIDATOR),
        this.FIELD_GEO_OBJECT_VALIDATOR,
        this.FIELD_GEO_OBJECT_MULTI_VALIDATOR,
        this.FILED_GEO_EDITOR_VALIDATOR,
        this.FILED_GEO_EDITOR_MULTI_VALIDATOR,
      ]),
    ),
  });

  public static getUIMetadata(params: { hasModelFields: boolean; hasSchemaCreateRight: boolean }): {
    shouldDisable: boolean;
    tooltipMessage: string | undefined;
  } {
    const { hasModelFields, hasSchemaCreateRight } = params;
    return {
      shouldDisable: hasModelFields || !hasSchemaCreateRight,
      tooltipMessage: !hasSchemaCreateRight
        ? t("Reader cannot import schema.")
        : !hasModelFields
          ? undefined
          : t("Only empty schemas can be imported into"),
    };
  }
}
