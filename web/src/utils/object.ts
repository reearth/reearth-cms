/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class ObjectUtils {
  public static shallowEqual(
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
  ): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return keys1.length === keys2.length && keys1.every(key => obj1[key] === obj2[key]);
  }

  public static safeJSONParse<T = Record<string, unknown>>(
    str: string,
  ): { isValid: true; data: T } | { isValid: false; error: string } {
    try {
      const data = JSON.parse(str) as T;
      return { isValid: true, data };
    } catch (e) {
      return { isValid: false, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  }

  public static isEmpty(obj: Record<string, unknown>): boolean {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) return false;
    }
    return true;
  }
}
