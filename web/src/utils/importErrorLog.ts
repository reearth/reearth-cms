/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import fileDownload from "js-file-download";
import z from "zod";

import { t } from "@reearth-cms/i18n";

export interface ErrorLogEntry {
  path: string;
  detail: string;
}

export interface ErrorLogMeta {
  fileName: string;
  source: "schema" | "content";
  totalErrors: number;
  entries: ErrorLogEntry[];
}

type SourceType = "schema" | "content" | "unknown";

export abstract class ImportErrorLogUtils {
  private static readonly MAX_ENTRIES = 1000;

  private static readonly SCHEMA_PATH_LABELS: Record<string, () => string> = {
    "x-defaultValue": () => t("Default value"),
    "x-fieldType": () => t("Field type"),
    "x-geoSupportedTypes": () => t("Supported types"),
    "x-geoSupportedType": () => t("Supported type"),
    "x-options": () => t("Options"),
    "x-multiple": () => t("Multiple"),
  };

  private static formatSchemaPath(pathSegments: (string | number)[]): string {
    const parts: string[] = [];
    let i = 0;

    if (pathSegments[0] === "properties" && pathSegments.length >= 2) {
      const fieldName = String(pathSegments[1]);
      parts.push(t('Field "{{name}}"', { name: fieldName }));
      i = 2;
    }

    for (; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const segStr = String(segment);
      const labelFn = this.SCHEMA_PATH_LABELS[segStr];
      if (labelFn) {
        parts.push(labelFn());
      } else {
        parts.push(segStr);
      }
    }

    return parts.join(" > ") || "(root)";
  }

  private static formatContentPath(pathSegments: (string | number)[]): string {
    const parts = pathSegments.map((segment, index) => {
      if (typeof segment === "number") {
        if (index === 0) {
          return t("Row {{number}}", { number: segment + 1 });
        }
        return `[${segment}]`;
      }
      return String(segment);
    });

    return parts.join(" > ") || "(root)";
  }

  private static detectSource(issues: z.core.$ZodIssue[]): SourceType {
    for (const issue of issues) {
      const path = issue.path ?? [];
      if (path.length > 0) {
        if (path[0] === "properties") return "schema";
        if (typeof path[0] === "number") return "content";
      }
    }
    return "unknown";
  }

  private static formatPath(pathSegments: (string | number)[], source: SourceType): string {
    if (source === "schema") return this.formatSchemaPath(pathSegments);
    if (source === "content") return this.formatContentPath(pathSegments);
    return pathSegments.map(String).join(".") || "(root)";
  }

  private static processUnionIssue(issue: z.core.$ZodIssue, source: SourceType): ErrorLogEntry[] {
    const parentPath = (issue.path ?? []) as (string | number)[];
    const unionErrors = (issue as z.core.$ZodIssue & { errors?: z.core.$ZodIssue[][] }).errors;
    if (!unionErrors || unionErrors.length === 0) {
      return [
        {
          path: this.formatPath(parentPath, source),
          detail: t("No valid field type matched this configuration"),
        },
      ];
    }

    // Check if all branch errors are at root level (simple literal union)
    const allRootLevel = unionErrors.every(branch =>
      branch.every(e => (e.path ?? []).length === 0),
    );

    if (allRootLevel) {
      // Try to aggregate invalid_value values
      const allValues: string[] = [];
      let allInvalidValue = true;
      for (const branch of unionErrors) {
        for (const e of branch) {
          if (e.code === "invalid_value" && "values" in e) {
            const values = (e as unknown as { values: string[] }).values;
            if (values) allValues.push(...values);
          } else {
            allInvalidValue = false;
          }
        }
      }

      if (allInvalidValue && allValues.length > 0) {
        const unique = [...new Set(allValues)];
        const detail = t("Invalid input: expected {{values}}", { values: unique });
        return [
          {
            path: this.formatPath(parentPath, source),
            detail,
          },
        ];
      }

      // Fallback for non-invalid_value root-level errors
      return [
        {
          path: this.formatPath(parentPath, source),
          detail: t("No valid field type matched this configuration"),
        },
      ];
    }

    // Find discriminator segment
    const discriminator = this.findDiscriminatorSegment(unionErrors);

    if (discriminator) {
      // Filter branches that DON'T have errors at the discriminator path
      const matchingBranches = unionErrors.filter(
        branch => !branch.some(e => String((e.path ?? [])[0]) === discriminator),
      );

      if (matchingBranches.length > 0) {
        // Pick the branch with fewest errors (most specific)
        const best = matchingBranches.reduce((a, b) => (a.length <= b.length ? a : b));
        return this.formatBranchIssues(best, parentPath, source);
      }

      // All branches fail at discriminator — collect invalid_value values
      const allValues: string[] = [];
      for (const branch of unionErrors) {
        for (const e of branch) {
          if (
            String((e.path ?? [])[0]) === discriminator &&
            e.code === "invalid_value" &&
            "values" in e
          ) {
            const values = (e as unknown as { values: string[] }).values;
            if (values) allValues.push(...values);
          }
        }
      }

      if (allValues.length > 0) {
        const unique = [...new Set(allValues)];
        const detail = t("Invalid input: expected {{values}}", { values: unique });
        const fullPath = [...parentPath, discriminator];
        return [
          {
            path: this.formatPath(fullPath, source),
            detail,
          },
        ];
      }
    }

    // Fallback: no discriminator or no invalid_value errors
    return [
      {
        path: this.formatPath(parentPath, source),
        detail: t("No valid field type matched this configuration"),
      },
    ];
  }

  private static findDiscriminatorSegment(branchErrors: z.core.$ZodIssue[][]): string | undefined {
    const segmentCounts = new Map<string, number>();
    for (const branch of branchErrors) {
      const seenSegments = new Set<string>();
      for (const e of branch) {
        const firstSeg = (e.path ?? [])[0];
        if (firstSeg !== undefined) {
          seenSegments.add(String(firstSeg));
        }
      }
      for (const seg of seenSegments) {
        segmentCounts.set(seg, (segmentCounts.get(seg) ?? 0) + 1);
      }
    }

    const threshold = branchErrors.length * 0.5;
    let best: string | undefined;
    let bestCount = 0;
    for (const [seg, count] of segmentCounts) {
      if (count > threshold && count > bestCount) {
        best = seg;
        bestCount = count;
      }
    }
    return best;
  }

  private static formatBranchIssues(
    branch: z.core.$ZodIssue[],
    parentPath: (string | number)[],
    source: SourceType,
  ): ErrorLogEntry[] {
    const entries: ErrorLogEntry[] = [];
    for (const branchIssue of branch) {
      if (branchIssue.code === "invalid_union" && "errors" in branchIssue) {
        const prepended = this.prependPath(branchIssue, parentPath);
        entries.push(...this.processUnionIssue(prepended, source));
      } else {
        const prepended = this.prependPath(branchIssue, parentPath);
        const pathSegments = (prepended.path ?? []) as (string | number)[];
        entries.push({
          path: this.formatPath(pathSegments, source),
          detail: prepended.message,
        });
      }
    }
    return entries;
  }

  private static prependPath(
    issue: z.core.$ZodIssue,
    parentPath: (string | number)[],
  ): z.core.$ZodIssue {
    if (parentPath.length === 0) return issue;
    const issuePath = (issue.path ?? []) as (string | number)[];
    // Check if path already starts with parentPath
    const alreadyPrepended = parentPath.every(
      (seg, i) => i < issuePath.length && String(issuePath[i]) === String(seg),
    );
    if (alreadyPrepended) return issue;
    return { ...issue, path: [...parentPath, ...issuePath] };
  }

  public static formatZodIssuesToLogEntries(issues: z.core.$ZodIssue[]): ErrorLogEntry[] {
    const entries: ErrorLogEntry[] = [];
    const source = this.detectSource(issues);
    const seenPaths = new Set<string>();

    for (const issue of issues) {
      if (entries.length >= this.MAX_ENTRIES) break;

      if (issue.code === "invalid_union" && "errors" in issue) {
        const unionEntries = this.processUnionIssue(issue, source);
        for (const entry of unionEntries) {
          if (entries.length >= this.MAX_ENTRIES) break;
          entries.push(entry);
        }
        continue;
      }

      const pathSegments = (issue.path ?? []) as (string | number)[];
      const pathKey = pathSegments.map(String).join(".");
      const path = this.formatPath(pathSegments, source);

      if (issue.code === "invalid_type" && seenPaths.has(pathKey)) {
        continue;
      }
      seenPaths.add(pathKey);

      entries.push({ path, detail: issue.message });
    }

    return entries;
  }

  public static formatErrorLogToText(meta: ErrorLogMeta): string {
    const lines: string[] = [];

    lines.push(`=== ${t("Import Error Log")} ===`);
    lines.push("");
    lines.push(`${t("File")}: ${meta.fileName}`);
    lines.push(`${t("Source")}: ${meta.source}`);
    lines.push(`${t("Timestamp")}: ${new Date().toISOString()}`);
    lines.push("");

    lines.push(`--- ${t("Summary")} ---`);
    lines.push(`${t("Total errors")}: ${meta.totalErrors}`);
    if (meta.totalErrors > meta.entries.length) {
      lines.push(
        t("Note: Only the first {{max}} errors are shown below.", { max: meta.entries.length }),
      );
    }
    lines.push("");

    const categories = new Map<string, number>();
    for (const entry of meta.entries) {
      const colonIndex = entry.detail.indexOf(":");
      const category = colonIndex >= 0 ? entry.detail.slice(0, colonIndex) : entry.detail;
      categories.set(category, (categories.get(category) ?? 0) + 1);
    }

    lines.push(`${t("Error categories")}:`);
    for (const [category, count] of categories) {
      lines.push(`  - ${category}: ${count}`);
    }
    lines.push("");

    lines.push(`--- ${t("Error Details")} ---`);
    lines.push("");

    for (let i = 0; i < meta.entries.length; i++) {
      const entry = meta.entries[i];
      lines.push(`#${i + 1}`);
      lines.push(`  ${t("Location")}: ${entry.path}`);
      lines.push(`  ${t("Detail")}: ${entry.detail}`);
      lines.push("");
    }

    if (meta.totalErrors > meta.entries.length) {
      lines.push(
        t("... and {{count}} more errors", { count: meta.totalErrors - meta.entries.length }),
      );
      lines.push("");
    }

    return lines.join("\n");
  }

  public static downloadErrorLog(meta: ErrorLogMeta): void {
    const text = this.formatErrorLogToText(meta);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const fileName = `import-error-log-${timestamp}.txt`;
    fileDownload(text, fileName, "text/plain");
  }
}
