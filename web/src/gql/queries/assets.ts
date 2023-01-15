import { gql } from "@apollo/client";

export const GET_ASSETS = gql`
  query GetAssets(
    $projectId: ID!
    $keyword: String
    $sort: AssetSort
    $pagination: Pagination
    $withFiles: Boolean!
  ) {
    assets(projectId: $projectId, keyword: $keyword, sort: $sort, pagination: $pagination) {
      edges {
        cursor
        node {
          ...assetFragment
        }
      }
      nodes {
        ...assetFragment
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

export const GET_ASSET = gql`
  query GetAsset($assetId: ID!, $withFiles: Boolean!) {
    asset(assetId: $assetId) {
      ...assetFragment
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset($projectId: ID!, $file: Upload, $url: String, $withFiles: Boolean!) {
    createAsset(input: { projectId: $projectId, file: $file, url: $url }) {
      asset {
        ...assetFragment
      }
    }
  }
`;

export const UPDATE_ASSET = gql`
  mutation UpdateAsset($id: ID!, $previewType: PreviewType, $withFiles: Boolean!) {
    updateAsset(input: { id: $id, previewType: $previewType }) {
      asset {
        ...assetFragment
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
