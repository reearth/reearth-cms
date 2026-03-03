import { ArchiveExtractionStatus, Asset } from "@reearth-cms/components/molecules/Asset/types";
import { Comment } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import {
  Item,
  ItemAsset,
  ItemField,
  VersionedItem,
} from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { Schema } from "@reearth-cms/components/molecules/Schema/types";
import { initialValuesGet } from "@reearth-cms/components/organisms/Project/Request/RequestDetails/utils";
import {
  Asset as GQLAsset,
  Comment as GQLComment,
  Item as GQLItem,
  Request as GQLRequest,
  VersionedItem as GQLVersionedItem,
} from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLItem = (GQLItem: GQLItem | undefined): Item | undefined => {
  if (!GQLItem) return;
  return {
    assets: GQLItem.assets
      ?.map(asset => asset && { fileName: asset.fileName, id: asset.id })
      .filter((asset): asset is ItemAsset => asset !== null),
    comments: GQLItem.thread?.comments?.map(comment => fromGraphQLComment(comment)) ?? [],
    createdAt: GQLItem.createdAt,
    createdBy: { id: GQLItem.createdBy?.id, name: GQLItem.createdBy?.name },
    fields: GQLItem.fields.map(
      field =>
        ({
          itemGroupId: field.itemGroupId,
          schemaFieldId: field.schemaFieldId,
          type: field.type,
          value: field.value,
        }) as ItemField,
    ),
    id: GQLItem.id,
    metadata: {
      fields: GQLItem.metadata?.fields.map(
        field =>
          ({
            schemaFieldId: field.schemaFieldId,
            type: field.type,
            value: field.value,
          }) as ItemField,
      ),
      id: GQLItem.metadata?.id,
      version: GQLItem.metadata?.version ?? "",
    },
    referencedItems:
      GQLItem.referencedItems?.map(item => ({
        createdAt: item.createdAt,
        createdBy: item.createdBy?.name ?? "",
        id: item.id,
        schemaId: item.schemaId,
        status: item.status,
        title: item.title ?? "",
        updatedAt: item.updatedAt,
        version: item?.version ?? "",
      })) ?? [],
    requests:
      GQLItem.requests?.map(request => ({
        id: request.id,
        state: request.state,
        title: request.title,
      })) ?? [],
    schemaId: GQLItem.schemaId,
    status: GQLItem.status,
    threadId: GQLItem.thread?.id ?? "",
    title: GQLItem.title ?? "",
    updatedAt: GQLItem.updatedAt,
    updatedBy: { id: GQLItem.updatedBy?.id, name: GQLItem.updatedBy?.name },
    version: GQLItem.version,
  };
};

export const fromGraphQLAsset = (asset: GQLAsset | undefined): Asset | undefined => {
  if (!asset) return;
  return {
    archiveExtractionStatus: asset.archiveExtractionStatus as ArchiveExtractionStatus,
    comments: asset.thread?.comments?.map(comment => fromGraphQLComment(comment)) ?? [],
    createdAt: asset.createdAt.toString(),
    createdBy: { id: asset.createdBy.id, name: asset.createdBy.name },
    createdByType: asset.createdByType,
    fileName: asset.fileName,
    id: asset.id,
    items: asset.items ?? [],
    previewType: asset.previewType || "UNKNOWN",
    projectId: asset.projectId,
    public: asset.public,
    size: asset.size,
    threadId: asset.thread?.id ?? "",
    url: asset.url,
  };
};

export const fromGraphQLRequest = (request: GQLRequest): Request => ({
  approvedAt: request.approvedAt ?? undefined,
  closedAt: request.closedAt ?? undefined,
  comments: request.thread?.comments?.map(comment => fromGraphQLComment(comment)) ?? [],
  createdAt: request.createdAt,
  createdBy: request.createdBy ?? undefined,
  description: request.description ?? "",
  id: request.id,
  items: request.items?.map(item => ({
    id: item.itemId,
    initialValues: initialValuesGet(item.item?.value.fields),
    modelId: item?.item?.value.modelId,
    modelName: item?.item?.value.model.name,
    referencedItems:
      item.item?.value.referencedItems?.map(item => ({
        createdAt: item.createdAt,
        createdBy: item.createdBy?.name ?? "",
        id: item.id,
        schemaId: item.schemaId,
        status: item.status,
        title: item.title ?? "",
        updatedAt: item.updatedAt,
        version: item?.version ?? "",
      })) ?? [],
    schema: item.item?.value.schema ? (item.item?.value.schema as Schema) : undefined,
    title: item.item?.value.title ?? "",
    version: item?.version ?? "",
  })),
  reviewers: request.reviewers,
  state: request.state,
  threadId: request.thread?.id ?? "",
  title: request.title,
  updatedAt: request.updatedAt,
});

export const fromGraphQLComment = (GQLComment: GQLComment): Comment => {
  return {
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
    id: GQLComment.id,
  };
};

export const fromGraphQLversionsByItem = (GQLVersionsByItem: GQLVersionedItem[]): VersionedItem[] =>
  GQLVersionsByItem.map(version => {
    const requests =
      version.value.requests
        ?.filter(
          request =>
            request.state === "WAITING" &&
            request.items.some(
              item =>
                item.item?.value.modelId === version.value.modelId &&
                item.itemId === version.value.id &&
                item.version === version.version,
            ),
        )
        .map(request => ({
          id: request.id,
          title: request.title,
        })) ?? [];
    return {
      creator: { name: version.value.updatedBy?.name ?? version.value.createdBy?.name ?? "" },
      fields: version.value.fields.map(
        field =>
          ({
            itemGroupId: field.itemGroupId,
            schemaFieldId: field.schemaFieldId,
            type: field.type,
            value: field.value,
          }) as ItemField,
      ),
      requests,
      status: version.refs.includes("public") ? "PUBLIC" : requests.length ? "REVIEW" : "DRAFT",
      timestamp: version.value.updatedAt ?? version.value.createdAt,
      version: version.version,
    };
  });
