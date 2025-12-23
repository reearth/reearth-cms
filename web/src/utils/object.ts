/* eslint-disable @typescript-eslint/no-extraneous-class */
import { check, getIssues, HintIssue } from "@placemarkio/check-geojson";
import type { GeoJSON } from "geojson";

import { PerformanceTimer } from "@reearth-cms/utils/performance";

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
  ): Promise<{ isValid: true; data: T } | { isValid: false; error: string }> {
    return new Promise<{ isValid: true; data: T } | { isValid: false; error: string }>(
      (resolve, _reject) => {
        setTimeout(() => {
          const timer = new PerformanceTimer("safeJSONParse");
          try {
            const data = JSON.parse(str) as T;
            resolve({ isValid: true, data });
          } catch (error) {
            resolve({
              isValid: false,
              error: error instanceof Error ? error.message : "Invalid JSON",
            });
          } finally {
            timer.log();
          }
        }, 0);
      },
    );
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
    raw: Record<string, unknown> | string | GeoJSON,
  ): Promise<{ isValid: true; data: GeoJSON } | { isValid: false; error: string }> {
    return new Promise<{ isValid: true; data: GeoJSON } | { isValid: false; error: string }>(
      (resolve, reject) => {
        setTimeout(() => {
          const timer = new PerformanceTimer("validateGeoJson");

          const parseRaw: string = typeof raw === "string" ? raw : JSON.stringify(raw);
          const issues: HintIssue[] = getIssues(parseRaw);

          if (issues.length > 0) {
            reject({
              isValid: false,
              error: JSON.stringify(
                issues.map(issue => issue.message),
                null,
                2,
              ),
            });
          } else {
            const data = check(parseRaw);
            resolve({ isValid: true, data });
          }

          timer.log();
        }, 0);
      },
    );
  }
}
