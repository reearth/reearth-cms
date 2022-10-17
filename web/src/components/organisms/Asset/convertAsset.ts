import { Asset, AssetFile, PreviewType } from "@reearth-cms/components/molecules/Asset/asset.type";
import { Asset as GQLAsset } from "@reearth-cms/gql/graphql-client-api";

export const convertAsset = (GQLAsset: GQLAsset | undefined): Asset | undefined => {
  if (!GQLAsset) return;
  return {
    id: GQLAsset.id,
    fileName: GQLAsset.fileName,
    createdAt: GQLAsset.createdAt.toString(),
    createdBy: GQLAsset.createdBy?.name ?? "",
    file: GQLAsset.file as AssetFile,
    previewType: GQLAsset.previewType as PreviewType,
    projectId: GQLAsset.projectId,
    size: GQLAsset.size,
    url: GQLAsset.url,
  };
};
