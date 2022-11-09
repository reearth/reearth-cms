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
            ... on User {
              id
              name
              email
            }
            ... on Integration {
              id
              name
              description
              logoUrl
              iType
              developer {
                id
                name
                email
              }
              config {
                token
                webhooks {
                  id
                  name
                  url
                  active
                  createdAt
                  updatedAt
                }
              }
              createdAt
              updatedAt
            }
          }
          createdByType
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
          url
          thread {
            id
            workspaceId
            comments {
              id
              author {
                id
                name
                email
              }
              content
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
          ... on User {
            id
            name
            email
          }
          ... on Integration {
            id
            name
            description
            logoUrl
            iType
            developer {
              id
              name
              email
            }
            config {
              token
              webhooks {
                id
                name
                url
                active
                createdAt
                updatedAt
              }
            }
            createdAt
            updatedAt
          }
        }
        createdByType
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
        url
        thread {
          id
          workspaceId
          comments {
            id
            author {
              id
              name
              email
            }
            content
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
        ... on User {
          id
          name
          email
        }
        ... on Integration {
          id
          name
          description
          logoUrl
          iType
          developer {
            id
            name
            email
          }
          config {
            token
            webhooks {
              id
              name
              url
              active
              createdAt
              updatedAt
            }
          }
          createdAt
          updatedAt
        }
      }
      createdByType
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
      url
      thread {
        id
        workspaceId
        comments {
          id
          author {
            id
            name
            email
          }
          content
          createdAt
        }
      }
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
        createdByType
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
        url
        thread {
          id
          workspaceId
          comments {
            id
            author {
              id
              name
              email
            }
            content
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
        createdByType
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
        url
        thread {
          id
          workspaceId
          comments {
            id
            author {
              id
              name
              email
            }
            content
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
