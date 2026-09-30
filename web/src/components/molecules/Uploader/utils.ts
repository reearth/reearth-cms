import type {
  ImportColumnResult,
  ImportJobResult,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportColumnStatus } from "@reearth-cms/gql/__generated__/graphql.generated";

import type { UploaderQueueItem } from "./types";

/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class ImportResultUtils {
  public static readonly CSV_EXTENSION: UploaderQueueItem["extension"] = "csv";

  public static countByStatus(
    importResult: ImportJobResult | null | undefined,
    status: ImportColumnStatus,
  ): number {
    if (!importResult) return 0;

    return importResult.columns.filter(column => column.status === status).length;
  }

  public static matchedCount(importResult: ImportJobResult | null | undefined): number {
    return this.countByStatus(importResult, ImportColumnStatus.Matched);
  }

  public static skippedCount(importResult: ImportJobResult | null | undefined): number {
    return this.countByStatus(importResult, ImportColumnStatus.Skipped);
  }

  // only CSV imports are reported per column: the server returns no columns for JSON and GeoJSON,
  // and jobs predating the feature have no import result at all
  public static hasColumnReport(queue: UploaderQueueItem): boolean {
    return (
      queue.extension === this.CSV_EXTENSION &&
      !!queue.importResult &&
      queue.importResult.columns.length > 0
    );
  }
}
