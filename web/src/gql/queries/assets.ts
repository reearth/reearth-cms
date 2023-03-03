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

export const GET_ASSETS_ITEMS = gql`
  query GetAssetsItems(
    $projectId: ID!
    $keyword: String
    $sort: AssetSort
    $pagination: Pagination
  ) {
    assets(projectId: $projectId, keyword: $keyword, sort: $sort, pagination: $pagination) {
      edges {
        cursor
        node {
          id
          items {
            itemId
            modelId
          }
        }
      }
      nodes {
        id
        items {
          itemId
          modelId
        }
      }
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

export const GET_ASSET_ITEM = gql`
  query GetAssetItem($assetId: ID!) {
    asset(assetId: $assetId) {
      id
      items {
        itemId
        modelId
      }
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset(
    $projectId: ID!
    $file: Upload
    $url: String
    $skipDecompression: Boolean
    $withFiles: Boolean!
  ) {
    createAsset(
      input: {
        projectId: $projectId
        file: $file
        url: $url
        skipDecompression: $skipDecompression
      }
    ) {
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
