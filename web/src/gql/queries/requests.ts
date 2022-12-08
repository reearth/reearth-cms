import { gql } from "@apollo/client";

import { requestFragment } from "@reearth-cms/gql/fragments";

export const GET_REQUESTS = gql`
  query GetRequests(
    $projectId: ID!
    $key: String
    $state: RequestState
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
  ) {
    requests(
      projectId: $projectId
      key: $key
      state: $state
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      edges {
        cursor
        node {
          ...requestFragment
        }
      }
      nodes {
        ...requestFragment
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }

  ${requestFragment}
`;

export const CREATE_REQUEST = gql`
  mutation CreateAsset(
    projectId: ID!
    title: String!
    description: String
    state: RequestState
    reviewersId: [ID!]
    items: [RequestItemInput!]!
  ) {
    createRequest(input: { projectId: $projectId, title: $title, description: $description, state: $state, reviewersId: $reviewersId, items: $items }) {
      request {
        ...requestFragment
      }
    }
  }
`;

export const UPDATE_REQUEST = gql`
  mutation UpdateRequest( 
    requestId: ID!
    title: String!
    description: String
    state: RequestState
    reviewersId: [ID!]
    items: [RequestItemInput!]!) {
    updateRequest(input: { requestId: $requestId, title: $title, description: $description, state: $state, reviewersId: $reviewersId, items: $items }) {
        request {
        ...requestFragment
      }
    }
  }
`;

export const DELETE_REQUEST = gql`
  mutation DeleteRequest($requestIds: ID!) {
    deleteAsset(input: { requestIds: $requestIds }) {
      request
    }
  }
`;
