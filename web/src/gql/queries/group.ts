import { gql } from "@apollo/client";

export const CREATE_GROUP = gql`
  mutation createGroup($projectId: ID!, $name: String!, $key: String!, $description: String) {
    createGroup(
      input: { projectId: $projectId, name: $name, key: $key, description: $description }
    ) {
      group {
        id
      }
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation updateGroup($groupId: ID!, $name: String!, $key: String!, $description: String) {
    updateGroup(input: { groupId: $groupId, name: $name, key: $key, description: $description }) {
      group {
        id
      }
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation deleteGroup($groupId: ID!) {
    deleteGroup(input: { groupId: $groupId }) {
      groupId
    }
  }
`;
