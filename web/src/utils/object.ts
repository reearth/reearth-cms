/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PerformanceTimer } from "@reearth-cms/utils/performance";

type ParseJSONResult<T> = { isValid: true; data: T } | { isValid: false; error: string };

export abstract class ObjectUtils {
  public static shallowEqual(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
  ): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return keys1.length === keys2.length && keys1.every(key => obj1[key] === obj2[key]);
  }

  /** Primitives, arrays and plain objects; key order doesn't matter. */
  public static isDeepEqual(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) || Array.isArray(b)) {
      return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((entry, i) => this.isDeepEqual(entry, b[i]))
      );
    }
    if (!this.isPlainObject(a) || !this.isPlainObject(b)) return false;
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every(key => Object.hasOwn(b, key) && this.isDeepEqual(a[key], b[key]))
    );
  }

  // Parses the outer JSON envelope only, leaving leaf string values untouched.
  // Field values must not be reinterpreted even if they happen to look like JSON
  // (e.g. a text field value of "123" or "true" must stay a string).
  public static parseJSONSync<T = Record<string, unknown>>(str: string): ParseJSONResult<T> {
    try {
      return { isValid: true, data: JSON.parse(str) as T };
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : "Invalid JSON" };
    }
  }

  public static async parseJSON<T = Record<string, unknown>>(
    str: string,
  ): Promise<ParseJSONResult<T>> {
    return new Promise<ParseJSONResult<T>>(resolve => {
      setTimeout(() => {
        const timer = new PerformanceTimer("parseJSON");
        resolve(ObjectUtils.parseJSONSync<T>(str));
        timer.log();
      }, 0);
    });
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
}
