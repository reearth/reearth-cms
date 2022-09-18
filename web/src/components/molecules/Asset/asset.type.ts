import { PreviewType as PreviewTypeType } from "./Asset/AssetBody/previewTypeSelect";

export type PreviewType = PreviewTypeType;

export type Asset = {
  id: string;
  createdAt: string;
  createdBy: string;
  file?: AssetFile;
  fileName?: string;
  previewType?: PreviewType;
  projectId?: string;
  size?: number;
  url?: string;
};

export type AssetFile = {
  files?: AssetFile[];
  contentType?: string;
  name: string;
  path: string;
  size: number;
};
