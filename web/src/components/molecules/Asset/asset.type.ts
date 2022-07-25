import { Asset as APIAsset } from "@reearth-cms/gql/graphql-client-api";

export interface Asset extends APIAsset {
  commentsCount?: number;
}
