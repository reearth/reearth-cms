import { RcFile } from "antd/es/upload";

import { JobState } from "@reearth-cms/gql/__generated__/graphql.generated";

export type UploaderQueueItem = {
  extension: "csv" | "geojson" | "json";
  file: RcFile;
  // file meta
  fileName: string;
  // job meta
  jobId: string;
  jobState: JobState;
  modelId: string;
  projectId: string;
  url: string;
  // model meta
  workspaceId: string;
};

export type UploaderState = {
  isOpen: boolean;
  queue: UploaderQueueItem[];
  showBadge: boolean;
};
