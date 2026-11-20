import type { Feature, FeatureCollection, Geometry } from "geojson";
import { z } from "zod";

import { t } from "@reearth-cms/i18n";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";
import { ObjectUtils } from "@reearth-cms/utils/object";

import { GeometryValidation } from "./validation";
import type { GeometryIssue, ValidateOptions } from "./validation";

/**
 * The boundary between the CMS field value and the editor's internal document.
 *
 * The Geometry field stores one GeoJSON geometry object, or a list of them when `multiple`
 * is on. The editor works on a FeatureCollection because the map diffs on feature ids —
 * those ids are internal and never reach the stored value.
 */

export type FieldValue = Geometry | Geometry[] | null;

/** Legacy Geometry Object/Editor fields still store GeoJSON strings; readers accept both. */
export type StoredValue = FieldValue | string | string[] | undefined;

/** Internal id -> the geometry the value held, to write untouched shapes back unrounded. */
export type Originals = ReadonlyMap<string, Geometry>;

export type ReadResult =
  | { readonly ok: true; readonly collection: FeatureCollection; readonly originals: Originals }
  | { readonly ok: false; readonly text: string; readonly issues: GeometryIssue[] };

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

/** Empty entries: nothing stored, or a blank legacy string. */
const BLANK_ENTRY_VALIDATOR = z.union([z.null(), z.undefined(), z.string().trim().length(0)]);

export function readFieldValue(
  value: StoredValue,
  multiple: boolean,
  options: ValidateOptions = {},
): ReadResult {
  const entries = (multiple ? (Array.isArray(value) ? value : []) : [value]).filter(
    entry => !BLANK_ENTRY_VALIDATOR.safeParse(entry).success,
  );
  if (!multiple && entries.length === 0) {
    return { ok: true, collection: EMPTY, originals: new Map() };
  }

  const parsed: unknown[] = [];
  const issues: GeometryIssue[] = [];
  entries.forEach((entry, i) => {
    if (typeof entry !== "string") {
      parsed.push(entry);
      return;
    }
    const result = ObjectUtils.parseJSONSync<unknown>(entry);
    if (result.isValid) {
      parsed.push(result.data);
    } else {
      // Kept as a string so the text panel still shows it and validation points at it.
      parsed.push(entry);
      issues.push({
        path: multiple ? `[${i}]` : "",
        message: t("Invalid JSON: {{message}}", {
          message: result.error,
          interpolation: { escapeValue: false },
        }),
      });
    }
  });

  const candidate = multiple ? parsed : parsed[0];
  if (!multiple && candidate === null) return { ok: true, collection: EMPTY, originals: new Map() };

  issues.push(...GeometryValidation.validateValue(candidate, multiple, options));
  if (issues.length > 0) {
    return { ok: false, text: JSON.stringify(candidate, null, 2), issues };
  }

  const collection = GeoUtils.toCollection(parsed as Geometry[]);
  const originals = new Map(
    collection.features.map((f, i) => [String(f.id), parsed[i] as Geometry]),
  );
  return { ok: true, collection, originals };
}

/** Serializes the editor document back into the field's value shape. */
export function writeFieldValue(
  collection: FeatureCollection,
  multiple: boolean,
  originals: Originals = new Map(),
): Geometry | Geometry[] | null {
  const values = collection.features
    .filter((feature): feature is Feature<Geometry> => !!feature.geometry)
    .map(feature => {
      const original = originals.get(String(feature.id));
      // The store rounds coordinates; an untouched shape keeps its stored precision and bbox.
      if (
        original !== undefined &&
        ObjectUtils.isDeepEqual(GeoUtils.roundGeometry(original), feature.geometry)
      ) {
        return original;
      }
      return feature.geometry;
    });
  return multiple ? values : (values[0] ?? null);
}

/** The text shown in the GeoJSON panel: exactly the value, pretty-printed. */
export function collectionToText(collection: FeatureCollection, multiple: boolean): string {
  const geometries = collection.features.map(f => f.geometry).filter(Boolean);
  if (multiple) return JSON.stringify(geometries, null, 2);
  return geometries[0] ? JSON.stringify(geometries[0], null, 2) : "";
}

export type TextParseResult =
  | { readonly ok: true; readonly geometries: Geometry[] }
  | { readonly ok: false; readonly issues: GeometryIssue[] };

export function parseText(
  text: string,
  multiple: boolean,
  options: ValidateOptions = {},
): TextParseResult {
  if (text.trim() === "") return { ok: true, geometries: [] };
  const result = ObjectUtils.parseJSONSync<unknown>(text);
  if (!result.isValid) {
    return {
      ok: false,
      issues: [
        {
          path: "",
          message: t("Invalid JSON: {{message}}", {
            message: result.error,
            interpolation: { escapeValue: false },
          }),
        },
      ],
    };
  }
  if (result.data === null) return { ok: true, geometries: [] };
  const issues = GeometryValidation.validateValue(result.data, multiple, options);
  if (issues.length > 0) return { ok: false, issues };
  return {
    ok: true,
    geometries: multiple ? (result.data as Geometry[]) : [result.data as Geometry],
  };
}

/** Rebuilds a collection from parsed geometries, reusing existing ids by position. */
export function withStableIds(
  geometries: readonly Geometry[],
  current: FeatureCollection,
): FeatureCollection {
  let next = GeoUtils.nextFeatureId(current);
  return {
    type: "FeatureCollection",
    features: geometries.map((geometry, i): Feature => {
      const existing = current.features[i];
      const id = existing ? String(existing.id) : next;
      if (!existing) next = `s${Number(next.slice(1)) + 1}`;
      return { type: "Feature", id, geometry, properties: {} };
    }),
  };
}
