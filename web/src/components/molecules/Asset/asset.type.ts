import { PreviewType as PreviewTypeType } from "./Asset/AssetBody/previewTypeSelect";

export type PreviewType = PreviewTypeType;
export type ArchiveExtractionStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED" | undefined;

export type Asset = {
  id: string;
  createdAt: string;
  createdBy: string;
  createdByType: string;
  file: AssetFile;
  fileName: string;
  previewType?: PreviewType;
  projectId: string;
  size: number;
  url: string;
  threadId: string;
  comments: Comment[];
  archiveExtractionStatus?: ArchiveExtractionStatus;
};

export type AssetFile = {
  children?: AssetFile[];
  contentType?: string;
  name: string;
  path: string;
  size: number;
};

export type Comment = {
  id: string;
  author: string;
  authorType: "User" | "Integration" | null;
  content: string;
  createdAt: string;
};
