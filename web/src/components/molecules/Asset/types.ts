import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import { SortDirection } from "@reearth-cms/components/molecules/View/types";

import { PreviewType as PreviewTypeType } from "./Asset/AssetBody/previewTypeSelect";

export type PreviewType = PreviewTypeType;
export type ArchiveExtractionStatus =
  | "DONE"
  | "FAILED"
  | "IN_PROGRESS"
  | "PENDING"
  | "SKIPPED"
  | undefined;

export type ViewerType =
  | "csv"
  | "geo_3d_tiles"
  | "geo_mvt"
  | "geo"
  | "image_svg"
  | "image"
  | "model_3d"
  | "unknown";

export type Asset = {
  archiveExtractionStatus?: ArchiveExtractionStatus;
  comments: Comment[];
  createdAt: string;
  createdBy: { id: string; name: string };
  createdByType: string;
  file?: AssetFile;
  fileName: string;
  id: string;
  items: AssetItem[];
  previewType?: PreviewType;
  projectId: string;
  public: boolean;
  size: number;
  threadId?: string;
  url: string;
};

export type AssetItem = {
  itemId: string;
  modelId: string;
};

export type AssetFile = {
  filePaths?: string[];
  name: string;
  path: string;
};

export type AssetSortType = "DATE" | "NAME" | "SIZE";

export type SortType = {
  direction: SortDirection;
  type: AssetSortType;
};
