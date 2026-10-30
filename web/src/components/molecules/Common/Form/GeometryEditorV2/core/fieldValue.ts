import type { Feature, FeatureCollection, Geometry } from "geojson";

import { t } from "@reearth-cms/i18n";
import { GeoUtils } from "@reearth-cms/utils/geoUtils";
import { ObjectUtils } from "@reearth-cms/utils/object";

import { validateValue } from "./validation";
import type { GeometryIssue, ValidateOptions } from "./validation";

/**
 * The boundary between the CMS field value and the editor's internal document.
 *
 * The field stores what it always has: one GeoJSON geometry serialized to a string, or a
 * list of such strings when `multiple` is on. The editor works on a
 * FeatureCollection because the map diffs on feature ids — those ids are internal and
 * never reach the stored value.
 */

export type FieldValue = string | string[] | null | undefined;

/** Internal id -> the exact string the value held, to keep untouched shapes byte-identical. */
export type Originals = ReadonlyMap<string, string>;

export type ReadResult =
  | { readonly ok: true; readonly collection: FeatureCollection; readonly originals: Originals }
  | { readonly ok: false; readonly text: string; readonly issues: GeometryIssue[] };

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

export function readFieldValue(
  value: FieldValue,
  multiple: boolean,
  options: ValidateOptions = {},
): ReadResult {
  const entries = (multiple ? (Array.isArray(value) ? value : []) : [value]).filter(
    (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
  );
  if (!multiple && entries.length === 0) {
    return { ok: true, collection: EMPTY, originals: new Map() };
  }

  const parsed: unknown[] = [];
  const issues: GeometryIssue[] = [];
  entries.forEach((entry, i) => {
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

  issues.push(...validateValue(candidate, multiple, options));
  if (issues.length > 0) {
    return { ok: false, text: JSON.stringify(candidate, null, 2), issues };
  }

  const collection = GeoUtils.toCollection(parsed as Geometry[]);
  const originals = new Map(collection.features.map((f, i) => [String(f.id), entries[i]]));
  return { ok: true, collection, originals };
}

/** Serializes the editor document back into the field's value shape. */
export function writeFieldValue(
  collection: FeatureCollection,
  multiple: boolean,
  originals: Originals = new Map(),
): string | string[] {
  const values = collection.features
    .filter((feature): feature is Feature<Geometry> => !!feature.geometry)
    .map(feature => {
      const original = originals.get(String(feature.id));
      if (original !== undefined) {
        const before = ObjectUtils.parseJSONSync<Geometry>(original);
        // Unchanged shapes keep their exact stored text so version history stays quiet.
        if (
          before.isValid &&
          ObjectUtils.isDeepEqual(GeoUtils.roundGeometry(before.data), feature.geometry)
        ) {
          return original;
        }
      }
      return JSON.stringify(feature.geometry);
    });
  return multiple ? values : (values[0] ?? "");
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
  const issues = validateValue(result.data, multiple, options);
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
