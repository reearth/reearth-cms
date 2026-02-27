/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { GeoJSON } from "geojson";

import { check, getIssues, HintIssue } from "@placemarkio/check-geojson";

import { PerformanceTimer } from "@reearth-cms/utils/performance";

type JsonValue = boolean | JsonArray | JsonObject | null | number | string;
type JsonObject = {
  [key: string]: JsonValue;
};
type JsonArray = {} & JsonValue[];

export abstract class ObjectUtils {
  public static shallowEqual(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
  ): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return keys1.length === keys2.length && keys1.every(key => obj1[key] === obj2[key]);
  }

  public static async safeJSONParse<T = Record<string, unknown>>(
    str: string,
  ): Promise<{ data: T; isValid: true; } | { error: string; isValid: false; }> {
    return new Promise<{ data: T; isValid: true; } | { error: string; isValid: false; }>(
      (resolve, _reject) => {
        setTimeout(() => {
          const timer = new PerformanceTimer("safeJSONParse");
          try {
            const data = this.deepJsonParse(str) as T;
            resolve({ data, isValid: true });
          } catch (error) {
            resolve({
              error: error instanceof Error ? error.message : "Invalid JSON",
              isValid: false,
            });
          } finally {
            timer.log();
          }
        }, 0);
      },
    );
  }

  public static deepJsonParse<T = JsonValue>(value: unknown): T {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return this.deepJsonParse<T>(parsed);
      } catch {
        return value as T;
      }
    }

    if (Array.isArray(value)) {
      return value.map(v => this.deepJsonParse(v)) as T;
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, this.deepJsonParse(val)]),
      ) as T;
    }

    return value as T;
  }

  public static isEmpty(obj: Record<string, unknown>): boolean {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) return false;
    }
    return true;
  }

  public static isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  public static validateGeoJson(
    raw: GeoJSON | Record<string, unknown> | string,
  ): Promise<{ data: GeoJSON; isValid: true; } | { error: string; isValid: false; }> {
    return new Promise<{ data: GeoJSON; isValid: true; } | { error: string; isValid: false; }>(
      (resolve, reject) => {
        setTimeout(() => {
          const timer = new PerformanceTimer("validateGeoJson");

          const parseRaw: string = typeof raw === "string" ? raw : JSON.stringify(raw);
          const issues: HintIssue[] = getIssues(parseRaw);

          if (issues.length > 0) {
            reject({
              error: JSON.stringify(
                issues.map(issue => issue.message),
                null,
                2,
              ),
              isValid: false,
            });
          } else {
            const data = check(parseRaw);
            resolve({ data, isValid: true });
          }

          timer.log();
        }, 0);
      },
    );
  }
}
