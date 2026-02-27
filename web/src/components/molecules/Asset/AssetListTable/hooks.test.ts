import { renderHook } from "@testing-library/react";
import { describe, test, expect } from "vitest";

import type { ArchiveExtractionStatus } from "@reearth-cms/components/molecules/Asset/types";

import useAssetListTable from "./hooks";

describe("AssetListTable hooks", () => {
  test("DONE status returns green color and Decompressed label", () => {
    const { result } = renderHook(() => useAssetListTable("DONE" as ArchiveExtractionStatus));
    expect(result.current.statusColor).toBe("#52C41A");
    expect(result.current.status).toBe("Decompressed");
  });

  test("FAILED status returns red color and Failed label", () => {
    const { result } = renderHook(() => useAssetListTable("FAILED" as ArchiveExtractionStatus));
    expect(result.current.statusColor).toBe("#F5222D");
    expect(result.current.status).toBe("Failed");
  });

  test("IN_PROGRESS status returns orange color and Decompressing label", () => {
    const { result } = renderHook(() =>
      useAssetListTable("IN_PROGRESS" as ArchiveExtractionStatus),
    );
    expect(result.current.statusColor).toBe("#FA8C16");
    expect(result.current.status).toBe("Decompressing");
  });

  test("SKIPPED status returns gray color and Skipped label", () => {
    const { result } = renderHook(() => useAssetListTable("SKIPPED" as ArchiveExtractionStatus));
    expect(result.current.statusColor).toBe("#BFBFBF");
    expect(result.current.status).toBe("Skipped");
  });

  test("PENDING status returns gray color and Pending label", () => {
    const { result } = renderHook(() => useAssetListTable("PENDING" as ArchiveExtractionStatus));
    expect(result.current.statusColor).toBe("#BFBFBF");
    expect(result.current.status).toBe("Pending");
  });

  test("unknown status returns empty strings", () => {
    const { result } = renderHook(() => useAssetListTable("UNKNOWN" as ArchiveExtractionStatus));
    expect(result.current.statusColor).toBe("");
    expect(result.current.status).toBe("");
  });
});
