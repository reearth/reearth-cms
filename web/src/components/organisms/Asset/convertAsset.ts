import {
  Asset,
  AssetFile,
  Comment,
  PreviewType,
} from "@reearth-cms/components/molecules/Asset/asset.type";
import { Asset as GQLAsset, Comment as GQLComment } from "@reearth-cms/gql/graphql-client-api";

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
    threadId: GQLAsset.thread?.id ?? "",
    comments: GQLAsset.thread?.comments?.map(comment => convertComment(comment)) ?? [],
  };
};

export const convertComment = (GQLComment: GQLComment): Comment => {
  return {
    id: GQLComment.id,
    author: GQLComment.author?.name ?? "",
    content: GQLComment.content,
    createdAt: GQLComment.createdAt.toString(),
  };
};
