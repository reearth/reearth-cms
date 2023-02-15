import {
  ArchiveExtractionStatus,
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
    createdByType: GQLAsset.createdByType,
    file: GQLAsset.file as AssetFile,
    previewType: GQLAsset.previewType as PreviewType,
    projectId: GQLAsset.projectId,
    size: GQLAsset.size,
    url: "http://localhost:3000/simple.czml",
    threadId: GQLAsset.thread?.id ?? "",
    comments: GQLAsset.thread?.comments?.map(comment => convertComment(comment)) ?? [],
    archiveExtractionStatus: GQLAsset.archiveExtractionStatus as ArchiveExtractionStatus,
  };
};

export const convertComment = (GQLComment: GQLComment): Comment => {
  return {
    id: GQLComment.id,
    author: {
      id: GQLComment.author?.id,
      name: GQLComment.author?.name ?? "Anonymous",
      type: GQLComment.author
        ? GQLComment.author.__typename === "User"
          ? "User"
          : "Integration"
        : null,
    },
    content: GQLComment.content,
    createdAt: GQLComment.createdAt.toString(),
  };
};
