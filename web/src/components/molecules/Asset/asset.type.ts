import { Asset as GQLAsset } from "@reearth-cms/gql/graphql-client-api";

export interface Asset extends GQLAsset {
  commentsCount?: number;
}
