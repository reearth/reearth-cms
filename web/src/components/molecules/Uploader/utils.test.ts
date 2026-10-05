import { describe, expect, test } from "vitest";

import { ImportColumnStatus, JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { Test } from "@reearth-cms/test/utils";

import type { ImportResult, UploaderQueueItem } from "./types";
import { ImportResultUtils } from "./utils";

const importResult: ImportResult = {
  total: 10,
  inserted: 8,
  columns: [
    { header: "name", status: ImportColumnStatus.Matched, schemaFieldKey: "name", reason: null },
    { header: "age", status: ImportColumnStatus.Matched, schemaFieldKey: "age", reason: null },
    {
      header: "unknown",
      status: ImportColumnStatus.Skipped,
      schemaFieldKey: null,
      reason: "no matching schema field for header 'unknown'",
    },
  ],
};

const createQueue = (override: Partial<UploaderQueueItem> = {}): UploaderQueueItem => ({
  jobId: "queue-1",
  jobState: { status: JobStatus.Completed, progress: null },
  fileName: "test.csv",
  extension: "csv",
  url: "/assets/test.csv",
  file: Test.createMockRcFile({ name: "test.csv" }),
  workspaceId: "workspace-1",
  projectId: "project-1",
  modelId: "model-1",
  importResult,
  ...override,
});

describe("Test ImportResultUtils", () => {
  test("Test counting columns by status", () => {
    expect(ImportResultUtils.matchedCount(importResult)).toBe(2);
    expect(ImportResultUtils.skippedCount(importResult)).toBe(1);
  });

  test("Test counting with no import result", () => {
    expect(ImportResultUtils.matchedCount(null)).toBe(0);
    expect(ImportResultUtils.skippedCount(null)).toBe(0);
    expect(ImportResultUtils.matchedCount(undefined)).toBe(0);
    expect(ImportResultUtils.skippedCount(undefined)).toBe(0);
  });

  test("Test counting with empty columns", () => {
    const emptyResult: ImportResult = { ...importResult, columns: [] };

    expect(ImportResultUtils.matchedCount(emptyResult)).toBe(0);
    expect(ImportResultUtils.skippedCount(emptyResult)).toBe(0);
  });

  test("Test column report for a CSV import", () => {
    expect(ImportResultUtils.hasColumnReport(createQueue())).toBe(true);
  });

  test("Test column report for non CSV imports", () => {
    expect(
      ImportResultUtils.hasColumnReport(createQueue({ extension: "json", fileName: "test.json" })),
    ).toBe(false);
    expect(
      ImportResultUtils.hasColumnReport(
        createQueue({ extension: "geojson", fileName: "test.geojson" }),
      ),
    ).toBe(false);
  });

  test("Test column report for a legacy job without an import result", () => {
    expect(ImportResultUtils.hasColumnReport(createQueue({ importResult: null }))).toBe(false);
    expect(ImportResultUtils.hasColumnReport(createQueue({ importResult: undefined }))).toBe(false);
  });

  test("Test column report when the server reported no columns", () => {
    expect(
      ImportResultUtils.hasColumnReport(
        createQueue({ importResult: { ...importResult, columns: [] } }),
      ),
    ).toBe(false);
  });
});
