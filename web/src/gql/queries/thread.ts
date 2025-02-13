import { gql } from "@apollo/client";

export const CREATE_THREAD = gql`
  mutation CreateThread($workspaceId: ID!, $resourceId: ID, $resourceType: ResourceType) {
    createThread(
      input: { workspaceId: $workspaceId, resourceId: $resourceId, resourceType: $resourceType }
    ) {
      thread {
        id
        workspaceId
      }
    }
  }
`;
