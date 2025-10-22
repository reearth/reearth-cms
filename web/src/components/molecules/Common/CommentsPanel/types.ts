import {
  GetAssetItemDocument,
  GetAssetsItemsDocument,
} from "@reearth-cms/gql/__generated__/assets.generated";
import { GetItemDocument, SearchItemDocument } from "@reearth-cms/gql/__generated__/item.generated";
import { GetRequestsDocument } from "@reearth-cms/gql/__generated__/requests.generated";

export type Comment = {
  id: string;
  author: { id?: string; name: string; type: "User" | "Integration" | null };
  content: string;
  createdAt: string;
};

export type RefetchQueries = (
  | typeof GetItemDocument
  | typeof SearchItemDocument
  | typeof GetAssetItemDocument
  | typeof GetAssetsItemsDocument
  | typeof GetRequestsDocument
)[];

export type ResourceType = "ITEM" | "ASSET" | "REQUEST";
