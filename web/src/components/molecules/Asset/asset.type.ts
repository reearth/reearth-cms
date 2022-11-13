import { Thread } from "../Common/ThreadSider/thread.types";

import { PreviewType as PreviewTypeType } from "./Asset/AssetBody/previewTypeSelect";

export type PreviewType = PreviewTypeType;

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
  thread: Thread;
  comments: Comment[];
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
  content: string;
  createdAt: string;
};
