import { RcFile } from "antd/es/upload";

import { JobProgress, JobStatus, JobType } from "@reearth-cms/gql/__generated__/graphql.generated";

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
  jobProgress: JobProgress | null;
  jobType: JobType;
  jobStatus: JobStatus;
};

export type UploaderState = {
  isOpen: boolean;
  showBadge: boolean;
  queue: UploaderQueueItem[];
};
