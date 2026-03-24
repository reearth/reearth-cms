import { expect, test, describe, vi } from "vitest";
import z from "zod";

import { ImportErrorLogUtils, ErrorLogMeta } from "./importErrorLog";

vi.mock("js-file-download", () => ({
  default: vi.fn(),
}));

describe("ImportErrorLogUtils", () => {
  describe("formatZodIssuesToLogEntries", () => {
    test("maps basic zod issues to entries with detail", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = schema.safeParse({ name: 123, age: "not-a-number" });
      expect(result.success).toBe(false);
      if (result.success) return;

      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(result.error.issues);
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach(entry => {
        expect(entry.path).toBeTruthy();
        expect(entry.detail).toBeTruthy();
      });
    });

    test("translates array index [0] to Row 1 for content arrays", () => {
      const schema = z
        .object({
          fieldKey: z.string(),
        })
        .array();

      const result = schema.safeParse([{ fieldKey: 123 }]);
      expect(result.success).toBe(false);
      if (result.success) return;

      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(result.error.issues);
      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].path).toContain("0");
    });

    test("deduplicates invalid_union to single entry when same path", () => {
      const schema = z.union([z.string(), z.number()]);
      const result = schema.safeParse(true);
      expect(result.success).toBe(false);
      if (result.success) return;

      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(result.error.issues);
      expect(entries.length).toBe(1);
      expect(entries[0].detail).toBe("No valid field type matched this configuration");
    });

    test("formats schema paths with field name and property labels", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "too_big",
          origin: "string",
          maximum: 5,
          message: "Too big",
          path: ["properties", "age", "x-defaultValue"],
        } as unknown as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toEqual(["properties", "age", "x-defaultValue"]);
      expect(entries[0].detail).toBe("Too big");
    });

    test("formats schema path for field type", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_value",
          values: ["Text", "Number"],
          message: "Invalid enum value",
          path: ["properties", "name", "x-fieldType"],
        } as unknown as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries[0].path).toEqual(["properties", "name", "x-fieldType"]);
    });

    test("caps entries at 1000", () => {
      const issues: z.core.$ZodIssue[] = [];
      for (let i = 0; i < 1500; i++) {
        issues.push({
          code: "custom",
          message: `Error ${i}`,
          path: [`field${i}`],
        } as z.core.$ZodIssue);
      }
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1000);
    });

    test("handles empty issues array", () => {
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries([]);
      expect(entries).toEqual([]);
    });

    test("handles issues with no path", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "custom",
          message: "Custom error",
          path: [],
        } as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toEqual([]);
    });

    test("selects best branch via discriminator and prepends parent path", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_union",
          path: ["properties", "myField"],
          message: "Invalid union",
          errors: [
            [
              {
                code: "invalid_value",
                values: ["text"],
                message: 'Invalid input: expected "text"',
                path: ["x-fieldType"],
              },
            ],
            [
              {
                code: "too_big",
                origin: "string",
                maximum: 5,
                message: "Too big",
                path: ["x-defaultValue"],
              },
            ],
            [
              {
                code: "invalid_value",
                values: ["number"],
                message: 'Invalid input: expected "number"',
                path: ["x-fieldType"],
              },
            ],
          ],
        } as unknown as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toEqual(["properties", "myField", "x-defaultValue"]);
      expect(entries[0].detail).toBe("Too big");
    });

    test("all branches fail at discriminator — aggregates invalid_value values", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_union",
          path: ["properties", "badField"],
          message: "Invalid union",
          errors: [
            [
              {
                code: "invalid_value",
                values: ["text", "textArea"],
                message: 'Invalid input: expected "text", "textArea"',
                path: ["x-fieldType"],
              },
            ],
            [
              {
                code: "invalid_value",
                values: ["number", "integer"],
                message: 'Invalid input: expected "number", "integer"',
                path: ["x-fieldType"],
              },
            ],
          ],
        } as unknown as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toEqual(["properties", "badField", "x-fieldType"]);
      expect(entries[0].detail).toContain("Invalid input: expected");
      expect(entries[0].detail).toContain("text");
      expect(entries[0].detail).toContain("number");
    });

    test("literal union aggregation — z.union of literals", () => {
      const schema = z.union([z.literal("A"), z.literal("B"), z.literal("C")]);
      const result = schema.safeParse("X");
      expect(result.success).toBe(false);
      if (result.success) return;

      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(result.error.issues);
      expect(entries.length).toBe(1);
      expect(entries[0].detail).toContain("Invalid input: expected");
      expect(entries[0].detail).toContain("A");
      expect(entries[0].detail).toContain("B");
      expect(entries[0].detail).toContain("C");
    });

    test("deduplicates invalid_type entries for the same path", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          message: "Expected string",
          path: ["field1"],
        } as z.core.$ZodIssue,
        {
          code: "invalid_type",
          expected: "number",
          received: "string",
          message: "Expected number",
          path: ["field1"],
        } as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
    });
  });

  describe("formatErrorLogToText", () => {
    test("produces formatted text output with Location and Detail", () => {
      const meta: ErrorLogMeta = {
        fileName: "test.json",
        source: "schema",
        totalErrors: 2,
        entries: [
          {
            path: ["Field \"age\"", "Default value"],
            detail: "Expected number, received string",
          },
          {
            path: ["Field \"name\"", "Field type"],
            detail: "Invalid input: expected one of Text, Number",
          },
        ],
      };

      const text = ImportErrorLogUtils.formatErrorLogToText(meta);
      expect(text).toContain("test.json");
      expect(text).toContain("schema");
      expect(text).toContain("#1");
      expect(text).toContain("#2");
      expect(text).toContain("Location");
      expect(text).toContain("Detail");
      expect(text).toContain('Field "age" > Default value');
      expect(text).toContain("Expected number, received string");
      expect(text).not.toContain("Issue:");
    });

    test("shows detail in entries", () => {
      const meta: ErrorLogMeta = {
        fileName: "test.json",
        source: "schema",
        totalErrors: 1,
        entries: [
          {
            path: ["Field \"age\""],
            detail: "Expected number, received string",
          },
        ],
      };

      const text = ImportErrorLogUtils.formatErrorLogToText(meta);
      expect(text).toContain("Detail");
      expect(text).toContain("Expected number, received string");
    });

    test("groups error categories by detail prefix", () => {
      const meta: ErrorLogMeta = {
        fileName: "test.json",
        source: "schema",
        totalErrors: 3,
        entries: [
          { path: ["a"], detail: "Type mismatch: expected number, got string" },
          { path: ["b"], detail: "Type mismatch: expected string, got number" },
          { path: ["c"], detail: "Text too long: maximum 5 characters" },
        ],
      };

      const text = ImportErrorLogUtils.formatErrorLogToText(meta);
      expect(text).toContain("Type mismatch: 2");
      expect(text).toContain("Text too long: 1");
    });

    test("shows truncation hint in summary when entries are capped", () => {
      const meta: ErrorLogMeta = {
        fileName: "big.json",
        source: "content",
        totalErrors: 1500,
        entries: [
          {
            path: ["Row 1", "field"],
            detail: "Type mismatch: expected string, got number",
          },
        ],
      };

      const text = ImportErrorLogUtils.formatErrorLogToText(meta);
      expect(text).toContain("Note: Only the first 1 errors are shown below.");
    });

    test("shows truncation notice when totalErrors > entries.length", () => {
      const meta: ErrorLogMeta = {
        fileName: "big.json",
        source: "content",
        totalErrors: 1500,
        entries: [
          {
            path: ["Row 1", "field"],
            detail: "Type mismatch: expected string, got number",
          },
        ],
      };

      const text = ImportErrorLogUtils.formatErrorLogToText(meta);
      expect(text).toContain("1499");
    });
  });

  describe("formatZodIssuesToLogEntries — additional paths", () => {
    test("E7: invalid_union with no errors array falls through to default", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_union",
          path: ["properties", "myField"],
          message: "Invalid union",
        } as unknown as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].detail).toBe("Invalid union");
    });

    test("E8: invalid_union with all root-level non-invalid_value errors", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_union",
          path: ["properties", "myField"],
          message: "Invalid union",
          errors: [
            [
              {
                code: "invalid_type",
                expected: "string",
                received: "number",
                message: "Expected string",
                path: [],
              },
            ],
            [
              {
                code: "invalid_type",
                expected: "number",
                received: "string",
                message: "Expected number",
                path: [],
              },
            ],
          ],
        } as unknown as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].detail).toBe("No valid field type matched this configuration");
    });

    test("E9: schema paths with x-geoSupportedTypes, x-options, x-multiple labels", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "custom",
          message: "Error in supported types",
          path: ["properties", "geoField", "x-geoSupportedTypes"],
        } as z.core.$ZodIssue,
        {
          code: "custom",
          message: "Error in options",
          path: ["properties", "selectField", "x-options"],
        } as z.core.$ZodIssue,
        {
          code: "custom",
          message: "Error in multiple",
          path: ["properties", "multiField", "x-multiple"],
        } as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(3);
      expect(entries[0].path).toEqual(["properties", "geoField", "x-geoSupportedTypes"]);
      expect(entries[1].path).toEqual(["properties", "selectField", "x-options"]);
      expect(entries[2].path).toEqual(["properties", "multiField", "x-multiple"]);
    });

    test("E10: content path with numeric index not at position 0", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          message: "Expected string",
          path: [0, "field", 1],
        } as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toEqual(["0", "field", "1"]);
    });

    test("E11: schema path with unknown property label passes through", () => {
      const issues: z.core.$ZodIssue[] = [
        {
          code: "custom",
          message: "Some error",
          path: ["properties", "myField", "unknownProp"],
        } as z.core.$ZodIssue,
      ];
      const entries = ImportErrorLogUtils.formatZodIssuesToLogEntries(issues);
      expect(entries.length).toBe(1);
      expect(entries[0].path).toEqual(["properties", "myField", "unknownProp"]);
    });
  });

  describe("formatErrorLogToText — truncation notice", () => {
    test("E12: shows '... and N more errors' when totalErrors > entries.length", () => {
      const meta: ErrorLogMeta = {
        fileName: "big.json",
        source: "content",
        totalErrors: 105,
        entries: [
          { path: ["Row 1", "field"], detail: "Type mismatch: expected string, got number" },
          { path: ["Row 2", "field"], detail: "Type mismatch: expected string, got boolean" },
        ],
      };

      const text = ImportErrorLogUtils.formatErrorLogToText(meta);
      expect(text).toContain("... and 103 more errors");
    });
  });

  describe("downloadErrorLog", () => {
    test("E13: calls fileDownload with correct filename pattern", async () => {
      const fileDownload = (await import("js-file-download")).default as unknown as ReturnType<
        typeof vi.fn
      >;
      fileDownload.mockClear();

      const meta: ErrorLogMeta = {
        fileName: "test.json",
        source: "schema",
        totalErrors: 1,
        entries: [{ path: ["Field \"name\""], detail: "Expected number, received string" }],
      };

      ImportErrorLogUtils.downloadErrorLog(meta);

      expect(fileDownload).toHaveBeenCalledTimes(1);
      const [text, fileName, mimeType] = fileDownload.mock.calls[0];
      expect(typeof text).toBe("string");
      expect(text).toContain("test.json");
      expect(fileName).toMatch(/^import-error-log-.*\.txt$/);
      expect(mimeType).toBe("text/plain");
    });
  });
});
