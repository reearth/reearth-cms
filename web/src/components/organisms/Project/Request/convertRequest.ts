import { Request, Comment } from "@reearth-cms/components/molecules/Request/types";
import { Request as GQLRequest, Comment as GQLComment } from "@reearth-cms/gql/graphql-client-api";

export const convertRequest = (GQLRequest: GQLRequest | undefined): Request | undefined => {
  if (!GQLRequest) return;
  return {
    id: GQLRequest.id,
    threadId: GQLRequest.thread?.id ?? "",
    comments: GQLRequest.thread?.comments?.map(comment => convertComment(comment)) ?? [],
    createdAt: GQLRequest.createdAt,
  };
};

export const convertComment = (GQLComment: GQLComment): Comment => {
  return {
    id: GQLComment.id,
    authorType: GQLComment.author.__typename === "User" ? "User" : "Integration",
    author: GQLComment.author?.name ?? "",
    content: GQLComment.content,
    createdAt: GQLComment.createdAt.toString(),
  };
};
