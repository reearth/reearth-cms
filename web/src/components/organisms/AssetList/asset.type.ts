import { Asset as APIAsset } from "@reearth-cms/gql/graphql-client-api";

export interface Asset extends APIAsset {
  unzipFile?: string;
  createdBy?: string;
  commentsCount?: number;
}
