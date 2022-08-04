import { gql } from "@apollo/client";

export const GET_ASSETS = gql`
  query GetAssets(
    $projectId: ID!
    $keyword: String
    $sort: AssetSortType
    $pagination: Pagination
  ) {
    assets(projectId: $projectId, keyword: $keyword, sort: $sort, pagination: $pagination) {
      edges {
        cursor
        node {
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
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset($projectId: ID!, $createdById: ID!, $file: Upload!) {
    createAsset(input: { projectId: $projectId, createdById: $createdById, file: $file }) {
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
