import { gql } from "@apollo/client";

import { threadFragment } from "@reearth-cms/gql/fragments";

export const requestFragment = gql`
  fragment requestFragment on Request {
    id
    items {
      itemId
      version
      ref
      item {
        version
        parents
        refs
      }
    }
    title
    description
    createdBy {
      id
      name
      email
    }
    workspaceId
    projectId
    threadId
    reviewersId
    state
    createdAt
    updatedAt
    approvedAt
    closedAt
    thread {
      ...threadFragment
    }
    project {
      id
      name
      createdAt
      updatedAt
    }
    reviewers {
      id
      name
      email
    }
  }
  ${threadFragment}
`;

export default requestFragment;
