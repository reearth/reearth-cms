import {
  Item,
  Comment,
  ItemField,
  ItemAsset,
} from "@reearth-cms/components/molecules/Content/types";
import { Item as GQLItem, Comment as GQLComment } from "@reearth-cms/gql/graphql-client-api";

export const convertItem = (GQLItem: GQLItem | undefined): Item | undefined => {
  if (!GQLItem) return;
  return {
    id: GQLItem.id,
    version: GQLItem.version,
    fields: GQLItem.fields.map(
      field =>
        ({
          schemaFieldId: field.schemaFieldId,
          itemGroupId: field.itemGroupId,
          type: field.type,
          value: field.value,
        }) as ItemField,
    ),
    status: GQLItem.status,
    referencedItems:
      GQLItem.referencedItems?.map(item => ({
        id: item.id,
        title: item.title ?? "",
        schemaId: item.schemaId,
        createdBy: item.createdBy?.name ?? "",
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) ?? [],
    createdBy: GQLItem.createdBy?.name,
    updatedBy: GQLItem.updatedBy?.name,
    createdAt: GQLItem.createdAt,
    updatedAt: GQLItem.updatedAt,
    schemaId: GQLItem.schemaId,
    threadId: GQLItem.thread?.id ?? "",
    metadata: {
      id: GQLItem.metadata?.id,
      version: GQLItem.metadata?.version ?? "",
      fields: GQLItem.metadata?.fields.map(
        field =>
          ({
            schemaFieldId: field.schemaFieldId,
            type: field.type,
            value: field.value,
          }) as ItemField,
      ),
    },
    comments: GQLItem.thread?.comments?.map(comment => convertComment(comment)) ?? [],
    assets: GQLItem.assets
      ?.map(asset => asset && { id: asset.id, fileName: asset.fileName })
      .filter((asset): asset is ItemAsset => asset !== null),
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
