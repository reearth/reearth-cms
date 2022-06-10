import { gql } from "@apollo/client";

export const GET_ASSETS = gql`
  query GetAssets(
    $workspaceId: ID!
    $sort: AssetSortType
    $keyword: String
    $pagination: Pagination
  ) {
    assets(
      workspaceId: $workspaceId
      keyword: $keyword
      sort: $sort
      pagination: $pagination
    ) {
      nodes {
        id
        createdAt
        workspaceId
        name
        size
        url
        contentType
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      totalCount
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset($workspaceId: ID!, $file: Upload!) {
    createAsset(input: { workspaceId: $workspaceId, file: $file }) {
      asset {
        id
        workspaceId
        name
        size
        url
        contentType
      }
    }
  }
`;

export const REMOVE_ASSET = gql`
  mutation RemoveAsset($assetId: ID!) {
    removeAsset(input: { assetId: $assetId }) {
      assetId
    }
  }
`;
