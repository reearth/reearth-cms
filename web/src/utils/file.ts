import { check, getIssues, type HintIssue } from "@placemarkio/check-geojson";
import { type GeoJSON } from "geojson";

import { RcFile } from "@reearth-cms/components/atoms/Upload";

/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class FileUtils {
  public static getExtension(filename?: string): string {
    if (!filename?.includes(".")) return "";

    return filename.toLowerCase().slice(filename.lastIndexOf(".") + 1, filename.length);
  }

  public static parseTextFile(
    file: RcFile,
    handleContent: (content: string | null) => void,
    handleError?: (error: DOMException | null | undefined) => void,
  ): void {
    const reader = new FileReader();

    reader.onload = event => {
      if (event.target && typeof event.target.result === "string") {
        handleContent(event.target.result);
      } else {
        handleContent(null);
      }
    };

    reader.onerror = event => {
      if (handleError) handleError(event.target?.error);
    };

    reader.readAsText(file);
  }

  public static validateGeoJson(
    raw: Record<string, unknown> | string,
  ): { isValid: true; data: GeoJSON } | { isValid: false; errors: string[] } {
    const parseRaw: string = typeof raw === "string" ? raw : JSON.stringify(raw);
    const issues: HintIssue[] = getIssues(parseRaw);

    if (issues.length > 0) {
      return {
        isValid: false,
        errors: issues.map(issue => issue.message),
      };
    } else {
      return {
        isValid: true,
        data: check(parseRaw),
      };
    }
  }
}
