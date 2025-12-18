export enum UploadStatus {
  Queued = "QUEUED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Canceled = "CANCELED",
}

export type UploaderQueueItem = {
  id: string;
  status: UploadStatus;
  fileName: string;
  fileContent: Record<string, unknown>[];
  progress: number; // 0~100
  url: string;
  error: string | null;
};

export type UploaderState = {
  isOpen: boolean;
  showBadge: boolean;
  queue: UploaderQueueItem[];
};
