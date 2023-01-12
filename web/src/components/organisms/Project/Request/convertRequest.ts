import { ProColumns } from "@ant-design/pro-table";

import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { Request, Comment } from "@reearth-cms/components/molecules/Request/types";
import {
  Request as GQLRequest,
  Comment as GQLComment,
  Schema,
  RequestItem,
  ItemField,
} from "@reearth-cms/gql/graphql-client-api";

export const convertRequest = (GQLRequest: GQLRequest | undefined): Request | undefined => {
  if (!GQLRequest) return;
  return {
    id: GQLRequest.id,
    threadId: GQLRequest.thread?.id ?? "",
    title: GQLRequest.title,
    description: GQLRequest.description ?? "",
    comments: GQLRequest.thread?.comments?.map(comment => convertComment(comment)) ?? [],
    createdAt: GQLRequest.createdAt,
    reviewers: GQLRequest.reviewers,
    state: GQLRequest.state,
    createdBy: GQLRequest.createdBy ?? undefined,
    updatedAt: GQLRequest.updatedAt,
    approvedAt: GQLRequest.approvedAt ?? undefined,
    closedAt: GQLRequest.closedAt ?? undefined,
    items: GQLRequest.items.map(item => ({
      id: item.itemId,
      modelName: item?.item?.value.model.name,
      initialValues: getInitialFormValues(item.item?.value.fields),
      schema: item.item?.value.schema ? item.item?.value.schema : undefined,
    })),
  };
};

export const convertComment = (GQLComment: GQLComment): Comment => {
  return {
    id: GQLComment.id,
    author: {
      id: GQLComment.author?.id,
      name: GQLComment.author?.name ?? "",
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

export const getContentTableFields = (requestItem: RequestItem): ContentTableField | undefined => {
  return requestItem.item
    ? {
        id: requestItem.item.value.id,
        schemaId: requestItem.item.value.schemaId,
        modelId: requestItem.item.value.modelId,
        fields: requestItem.item.value.fields?.reduce(
          (obj, field) =>
            Object.assign(obj, {
              [field.schemaFieldId]: Array.isArray(field.value)
                ? field.value.join(", ")
                : field.value,
            }),
          {},
        ),
        comments: [],
      }
    : undefined;
};

export const getContentTableColumns = (
  schema: Schema,
): ProColumns<ContentTableField>[] | undefined => {
  return schema.fields.map(field => ({
    title: field.title,
    dataIndex: ["fields", field.id],
    key: field.id,
    width: 128,
    minWidth: 128,
    ellipsis: true,
  }));
};

export const getInitialFormValues = (fields?: ItemField[]): { [key: string]: any } => {
  const initialValues: { [key: string]: any } = {};
  fields?.forEach(field => {
    initialValues[field.schemaFieldId] = field.value;
  });
  return initialValues;
};
