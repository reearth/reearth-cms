import type { RcFile } from "antd/es/upload";

import type { ImportJobResult, JobState } from "@reearth-cms/gql/__generated__/graphql.generated";

// the schema still exposes updated/ignored, but GraphQL imports always insert so they are never queried
export type ImportResult = Omit<ImportJobResult, "updated" | "ignored">;

export type UploaderQueueItem = {
  // file meta
  fileName: string;
  extension: "csv" | "json" | "geojson";
  url: string;
  file: RcFile;
  // model meta
  workspaceId: string;
  projectId: string;
  modelId: string;
  // job meta
  jobId: string;
  jobState: JobState;
  // fetched separately once the job completes: the jobState subscription does not carry it
  importResult?: ImportResult | null;
};

export type UploaderState = {
  isOpen: boolean;
  showBadge: boolean;
  queue: UploaderQueueItem[];
};
