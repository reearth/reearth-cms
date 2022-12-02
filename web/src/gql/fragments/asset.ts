import { gql } from "@apollo/client";

import { assetFileFragment, threadFragment, integrationFragment } from "@reearth-cms/gql/fragments";

export const assetFragment = gql`
  fragment assetFragment on Asset {
    id
    projectId
    createdAt
    createdBy {
      ... on User {
        id
        name
        email
      }
      ... on Integration {
        ...integrationFragment
      }
    }
    createdByType
    fileName
    size
    previewType
    file {
      ...assetFileFragment
      children {
        ...assetFileFragment
        children {
          ...assetFileFragment
          children {
            ...assetFileFragment
            children {
              ...assetFileFragment
              children {
                ...assetFileFragment
              }
            }
          }
        }
      }
    }
    uuid
    url
    thread {
      ...threadFragment
    }
  }
  ${assetFileFragment}
  ${integrationFragment}
  ${threadFragment}
`;

export default assetFragment;
