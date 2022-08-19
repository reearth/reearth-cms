import { gql } from "@apollo/client";

export const GET_ASSETS = gql`
  query GetAssets(
    $projectId: ID!
    $keyword: String
    $sort: AssetSortType
    $pagination: Pagination
  ) {
    assets(projectId: $projectId, keyword: $keyword, sort: $sort, pagination: $pagination) {
      nodes {
        id
        projectId
        createdAt
        createdById
        fileName
        size
        previewType
        file {
          name
          size
          contentType
          path
        }
        hash
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
  mutation CreateAsset($projectId: ID!, $file: Upload!) {
    createAsset(input: { projectId: $projectId, file: $file }) {
      asset {
        id
        projectId
        createdAt
        createdById
        fileName
        size
        previewType
        file {
          name
          size
          contentType
          path
        }
        hash
      }
    }
  }
`;

export const DELETE_ASSET = gql`
  mutation DeleteAsset($assetId: ID!) {
    deleteAsset(input: { assetId: $assetId }) {
      assetId
    }
  }
`;
