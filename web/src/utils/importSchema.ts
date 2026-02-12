/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import { t } from "i18next";
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
  ExportSchemaFieldType,
} from "@reearth-cms/components/molecules/Schema/types";

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

// geo editor common
interface FieldGeoEditorBase extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.GeometryEditor;
  "x-multiple"?: false;
  "x-geoSupportedType": EditorSupportedType;
}

interface FieldGeoEditorBaseMulti extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.GeometryEditor;
  "x-multiple"?: true;
  "x-geoSupportedType": EditorSupportedType;
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

export interface FieldGeoObject<S extends readonly ObjectSupportedType[] = ObjectSupportedType[]>
  extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.GeometryObject;
  "x-multiple"?: false;
  "x-geoSupportedTypes": S;
  "x-defaultValue"?: SupportTypeToGeoJSON<S>;
}

export interface FieldGeoObjectMulti<S extends ObjectSupportedType[] = ObjectSupportedType[]>
  extends FieldBase {
  "x-fieldType": ExportSchemaFieldType.GeometryObject;
  "x-multiple"?: true;
  "x-geoSupportedTypes": S;
  "x-defaultValue"?: SupportTypeToGeoJSON<S>[];
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
  "x-defaultValue"?: GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon;
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
  "x-defaultValue"?: (GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon)[];
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
      "x-multiple": z.literal(true).default(true).optional(),
      "x-defaultValue": z.string().array().optional(),
    })
    .superRefine((values, context) => {
      const { "x-defaultValue": defaultValue, maxLength } = values;
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
      "x-fieldType": z.literal(ExportSchemaFieldType.GeometryObject),
      "x-multiple": z.literal(false).default(false).optional(),
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
    })
    .superRefine((values, context) => {
      const { "x-geoSupportedTypes": geoSupportedTypes, "x-defaultValue": defaultValue } = values;

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
      "x-fieldType": z.literal(ExportSchemaFieldType.GeometryObject),
      "x-multiple": z.literal(true).default(true).optional(),
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
    })
    .superRefine((values, context) => {
      const { "x-geoSupportedTypes": geoSupportedTypes, "x-defaultValue": defaultValue } = values;

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
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-multiple": z.literal(false).default(false).optional(),
        "x-geoSupportedType": z.literal("POINT"),
        "x-defaultValue": GeoJSONPointSchema.optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-multiple": z.literal(false).default(false).optional(),
        "x-geoSupportedType": z.literal("LINESTRING"),
        "x-defaultValue": GeoJSONLineStringSchema.optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-multiple": z.literal(false).default(false).optional(),
        "x-geoSupportedType": z.literal("POLYGON"),
        "x-defaultValue": GeoJSONPolygonSchema.optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
    z
      .object({
        "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
        "x-multiple": z.literal(false).default(false).optional(),
        "x-geoSupportedType": z.literal("ANY"),
        "x-defaultValue": z
          .union([GeoJSONPointSchema, GeoJSONLineStringSchema, GeoJSONPolygonSchema])
          .optional(),
      })
      .and(this.FIELD_BASE_VALIDATOR),
  ]);

  private static readonly FILED_GEO_EDITOR_MULTI_VALIDATOR: z.ZodType<FieldGeoEditorMulti> =
    z.union([
      z
        .object({
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-multiple": z.literal(true).default(true).optional(),
          "x-geoSupportedType": z.literal("POINT"),
          "x-defaultValue": GeoJSONPointSchema.array().optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-multiple": z.literal(true).default(true).optional(),
          "x-geoSupportedType": z.literal("LINESTRING"),
          "x-defaultValue": GeoJSONLineStringSchema.array().optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-multiple": z.literal(true).default(true).optional(),
          "x-geoSupportedType": z.literal("POLYGON"),
          "x-defaultValue": GeoJSONPolygonSchema.array().optional(),
        })
        .and(this.FIELD_BASE_VALIDATOR),
      z
        .object({
          "x-fieldType": z.literal(ExportSchemaFieldType.GeometryEditor),
          "x-multiple": z.literal(true).default(true).optional(),
          "x-geoSupportedType": z.literal("ANY"),
          "x-defaultValue": z
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
            "x-fieldType": z.literal(ExportSchemaFieldType.Number),
            maximum: z.number().optional(),
            minimum: z.number().optional(),
            "x-defaultValue": z.number().array().optional(),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

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
            "x-fieldType": z.literal(ExportSchemaFieldType.Integer),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            "x-defaultValue": z.int().optional(),
            "x-multiple": z.literal(false).default(false).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

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
            "x-fieldType": z.literal(ExportSchemaFieldType.Integer),
            maximum: z.int().optional(),
            minimum: z.int().optional(),
            "x-defaultValue": z.int().array().optional(),
            "x-multiple": z.literal(true).default(true).optional(),
          })
          .superRefine((values, context) => {
            const { maximum, minimum, "x-defaultValue": defaultValue } = values;

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
                message: "defaultValue should be in one of values",
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
                message: "defaultValue should be in one of values",
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
        this.FIELD_GEO_OBJECT_VALIDATOR,
        this.FIELD_GEO_OBJECT_MULTI_VALIDATOR,
        this.FILED_GEO_EDITOR_VALIDATOR,
        this.FILED_GEO_EDITOR_MULTI_VALIDATOR,
      ]),
    ),
  });

  public static getUIMetadata(params: { hasSchemaCreateRight: boolean; hasModelFields: boolean }): {
    tooltipMessage: string | undefined;
    shouldDisable: boolean;
  } {
    const { hasModelFields, hasSchemaCreateRight } = params;
    return {
      tooltipMessage: !hasSchemaCreateRight
        ? t("Reader cannot import schema.")
        : !hasModelFields
          ? undefined
          : t("Only empty schemas can be imported into"),
      shouldDisable: hasModelFields || !hasSchemaCreateRight,
    };
  }
}
