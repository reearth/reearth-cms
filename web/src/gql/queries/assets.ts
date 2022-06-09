import { gql } from "@apollo/client";

export const GET_ASSETS = gql`
  query GetAssets(
    $teamId: ID!
    $sort: AssetSortType
    $keyword: String
    $pagination: Pagination
  ) {
    assets(
      teamId: $teamId
      keyword: $keyword
      sort: $sort
      pagination: $pagination
    ) {
      nodes {
        id
        createdAt
        teamId
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
  mutation CreateAsset($teamid: ID!, $file: Upload!) {
    createAsset(input: { teamId: $teamid, file: $file }) {
      asset {
        id
        teamId
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
