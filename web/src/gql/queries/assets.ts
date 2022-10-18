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
          createdBy {
            id
            name
            email
          }
          fileName
          size
          previewType
          file {
            name
            size
            contentType
            path
          }
          uuid
          threadId
          thread {
            id
            workspaceId
            comments {
              id
              content
              author {
                id
                name
                email
              }
              createdAt
            }
          }
        }
      }
      nodes {
        id
        projectId
        createdAt
        createdBy {
          id
          name
          email
        }
        fileName
        size
        previewType
        file {
          name
          size
          contentType
          path
        }
        uuid
        threadId
        thread {
          id
          workspaceId
          comments {
            id
            content
            author {
              id
              name
              email
            }
            createdAt
          }
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
    asset(assetId: $assetId) {
      id
      projectId
      createdAt
      createdBy {
        id
        name
        email
      }
      fileName
      size
      previewType
      file {
        name
        size
        contentType
        path
      }
      uuid
      threadId
      thread {
        comments {
          id
          author {
        }
      }
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
        uuid
        threadId
        thread {
          id
          workspaceId
          comments {
            id
            content
            author {
              id
              name
              email
            }
            createdAt
          }
        }
      }
    }
  }
`;

export const UPDATE_ASSET = gql`
  mutation UpdateAsset($id: ID!, $previewType: PreviewType) {
    updateAsset(input: { id: $id, previewType: $previewType }) {
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
        uuid
        threadId
        thread {
          id
          workspaceId
          comments {
            id
            content
            author {
              id
              name
              email
            }
            createdAt
          }
        }
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
