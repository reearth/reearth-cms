import { Asset as APIAsset } from "@reearth-cms/gql/graphql-client-api";

export interface Asset extends APIAsset {
  key?: number;
  file?: string;
  unzipFile?: string;
  mimeType?: string;
  createdBy?: string;
}

// id
// createdAt
// teamId
// name
// size
// url
// contentType
