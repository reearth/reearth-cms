import { ProColumns } from "@ant-design/pro-table";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";

import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { Request, Comment } from "@reearth-cms/components/molecules/Request/types";
import {
  Request as GQLRequest,
  Comment as GQLComment,
  Schema,
  RequestItem,
} from "@reearth-cms/gql/graphql-client-api";

export const convertRequest = (GQLRequest: GQLRequest | undefined, assetList?: Asset[]): Request | undefined => {
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
      fields: getContentTableFields(item, assetList),
      columns: item.item?.value.schema
        ? getContentTableColumns(item.item?.value.schema)
        : undefined,
    })),
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
    author: GQLComment.author?.name ?? "",
    content: GQLComment.content,
    createdAt: GQLComment.createdAt.toString(),
  };
};

export const getContentTableFields = (requestItem: RequestItem, assetList?: Asset[]): ContentTableField | undefined => {
  return requestItem.item
    ? {
        id: requestItem.item.value.id,
        schemaId: requestItem.item.value.schemaId,
        modelId: requestItem.item.value.modelId,
        fields: requestItem.item.value.fields?.reduce(
          (obj, field) =>
          Object.assign(obj, {
            [field.schemaFieldId]:
              field.type === "Asset" && assetList
                ? Array.isArray(field.value)
                  ? field.value
                      .map(value => assetList.find(asset => asset.id === value)?.fileName)
                      .join(", ")
                  : assetList.find(asset => asset.id === field.value)?.fileName
                : Array.isArray(field.value)
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
