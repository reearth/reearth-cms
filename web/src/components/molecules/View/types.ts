import { Condition, FieldSelector, NewItemSort } from "@reearth-cms/gql/graphql-client-api";

export type View = {
  id: string;
  name: string;
  modelId?: string;
  projectId?: string;
  sort?: NewItemSort;
  filter?: Condition;
  columns?: FieldSelector[];
};
