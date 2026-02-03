import { RcFile } from "antd/es/upload";

import { JobState } from "@reearth-cms/gql/__generated__/graphql.generated";

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
};

export type UploaderState = {
  isOpen: boolean;
  showBadge: boolean;
  queue: UploaderQueueItem[];
};
