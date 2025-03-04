import { gql } from "@apollo/client";

export const CREATE_THREAD_WITH_COMMENT = gql`
  mutation CreateThreadWithComment(
    $workspaceId: ID!
    $resourceId: ID!
    $resourceType: ResourceType!
    $content: String!
  ) {
    createThreadWithComment(
      input: {
        workspaceId: $workspaceId
        resourceId: $resourceId
        resourceType: $resourceType
        content: $content
      }
    ) {
      thread {
        id
        workspaceId
        comments {
          id
          author {
            ... on User {
              id
              name
              email
            }
            ... on Integration {
              id
              name
            }
          }
          authorType
          authorId
          content
          createdAt
        }
      }
    }
  }
`;
