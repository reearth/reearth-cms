import { PreviewType } from "./Asset/AssetBody/previewTypeSelect";

export type Asset = {
  __typename?: "Asset";
  createdAt: Date;
  createdById: string;
  file: AssetFile;
  fileName: string;
  uuid: string;
  id: string;
  previewType?: PreviewType;
  projectId: string;
  size: number;
};

export type AssetFile = {
  __typename?: "AssetFile";
  children?: Array<AssetFile>;
  contentType?: string;
  name: string;
  path: string;
  size: number;
};
