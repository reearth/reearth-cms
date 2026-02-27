export type Comment = {
  author: { id?: string; name: string; type: "Integration" | "User" | null };
  content: string;
  createdAt: string;
  id: string;
};

export type RefetchQueries = (
  | "GetAssetItem"
  | "GetAssetsItems"
  | "GetItem"
  | "GetRequests"
  | "SearchItem"
)[];

export type ResourceType = "ASSET" | "ITEM" | "REQUEST";
