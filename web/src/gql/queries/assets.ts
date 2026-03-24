import { gql } from "@apollo/client";

export const GET_ASSETS = gql`
  query GetAssets(
    $projectId: ID!
    $keyword: String
    $sort: AssetSort
    $pagination: Pagination
    $contentTypes: [ContentTypesEnum!]
  ) {
    assets(
      input: {
        query: { project: $projectId, keyword: $keyword, contentTypes: $contentTypes }
        sort: $sort
        pagination: $pagination
      }
    ) {
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
    $contentTypes: [ContentTypesEnum!]
  ) {
    assets(
      input: {
        query: { project: $projectId, keyword: $keyword, contentTypes: $contentTypes }
        sort: $sort
        pagination: $pagination
      }
    ) {
      nodes {
        ...assetFragment
        items {
          itemId
          modelId
        }
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
  query GetAsset($assetId: ID!) {
    node(id: $assetId, type: ASSET) {
      ...assetFragment
    }
  }
`;

export const GET_ASSET_FILE = gql`
  query GetAssetFile($assetId: ID!) {
    assetFile(assetId: $assetId) {
      ...assetFileFragment
    }
  }
`;

export const GET_ASSET_ITEM = gql`
  query GetAssetItem($assetId: ID!) {
    node(id: $assetId, type: ASSET) {
      ... on Asset {
        ...assetFragment
        items {
          itemId
          modelId
        }
      }
    }
  }
`;

export const GUESS_SCHEMA_FIELDS = gql`
  query GuessSchemaFields($assetId: ID!, $modelId: ID!) {
    guessSchemaFields(input: { assetId: $assetId, modelId: $modelId }) {
      total_count
      fields {
        name
        type
      }
    }
  }
`;

export const CREATE_ASSET = gql`
  mutation CreateAsset(
    $projectId: ID!
    $file: Upload
    $token: String
    $url: String
    $skipDecompression: Boolean
  ) {
    createAsset(
      input: {
        projectId: $projectId
        file: $file
        token: $token
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
  mutation UpdateAsset($id: ID!, $previewType: PreviewType) {
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

export const DELETE_ASSETS = gql`
  mutation DeleteAssets($assetIds: [ID!]!) {
    deleteAssets(input: { assetIds: $assetIds }) {
      assetIds
    }
  }
`;

export const DECOMPRESS_ASSET = gql`
  mutation DecompressAsset($assetId: ID!) {
    decompressAsset(input: { assetId: $assetId }) {
      asset {
        ...assetFragment
      }
    }
  }
`;

export const CREATE_ASSET_UPLOAD = gql`
  mutation CreateAssetUpload(
    $projectId: ID!
    $filename: String!
    $cursor: String!
    $contentLength: Int!
    $contentEncoding: String
  ) {
    createAssetUpload(
      input: {
        projectId: $projectId
        filename: $filename
        cursor: $cursor
        contentLength: $contentLength
        contentEncoding: $contentEncoding
      }
    ) {
      url
      token
      contentType
      contentLength
      contentEncoding
      next
    }
  }
`;
