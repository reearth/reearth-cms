import { Item, Comment } from "@reearth-cms/components/molecules/Content/types";
import { Item as GQLItem, Comment as GQLComment } from "@reearth-cms/gql/graphql-client-api";

export const convertItem = (GQLItem: GQLItem | undefined): Item | undefined => {
  if (!GQLItem) return;
  return {
    id: GQLItem.id,
    fields: GQLItem.fields.map(field => ({
      schemaFieldId: field.schemaFieldId,
      type: field.type,
      value: field.value,
    })),
    schemaId: GQLItem.schemaId,
    threadId: GQLItem.thread?.id ?? "",
    comments: GQLItem.thread?.comments?.map(comment => convertComment(comment)) ?? [],
  };
};

export const convertComment = (GQLComment: GQLComment): Comment => {
  return {
    id: GQLComment.id,
    authorType: GQLComment.author
      ? GQLComment.author.__typename === "User"
        ? "User"
        : "Integration"
      : null,
    author: GQLComment.author?.name ?? "Anonymous",
    content: GQLComment.content,
    createdAt: GQLComment.createdAt.toString(),
  };
};
