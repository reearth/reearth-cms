/* eslint-disable @typescript-eslint/no-extraneous-class */
import { z } from "zod";

import { Constant } from "./constant";

export abstract class RegexUtils {
  public static readonly ALIAS_REGEX: RegExp = new RegExp("^[a-z0-9\\-_]+$");

  private static readonly KEY_REGEX: RegExp = new RegExp(
    `^[a-zA-Z0-9_-]{1,${Constant.KEY.MAX_LENGTH}}$`,
  );

  private static readonly URL_REGEX: RegExp =
    /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

  // A web origin: http/https URL with a host and no path, query, fragment, or wildcard.
  private static readonly ORIGIN_SCHEMA = z.url({ protocol: /^https?$/ }).refine(origin => {
    // not allow wildcard for now
    if (origin.includes("*")) return false;

    try {
      const u = new URL(origin);
      return (u.pathname === "" || u.pathname === "/") && !u.search && !u.hash;
    } catch {
      return false;
    }
  });

  public static validateOrigin(origin: string): boolean {
    return this.ORIGIN_SCHEMA.safeParse(origin).success;
  }

  public static validateKey(key: string): boolean {
    return this.KEY_REGEX.test(key);
  }

  public static validateURL(url: string): boolean {
    return this.URL_REGEX.test(url);
  }
}
