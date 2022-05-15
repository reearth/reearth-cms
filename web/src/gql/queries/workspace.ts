import { gql } from "@apollo/client";
import { workspaceFragment } from "@reearth-cms/gql/fragments";

export const GET_WORKSPACES = gql`
  query GetWorkspaces {
    me {
      id
      name
      myWorkspace {
        id
        ...WorkspaceFragment
      }
      workspaces {
        id
        ...WorkspaceFragment
      }
    }
  }

  ${workspaceFragment}
`;

export const UPDATE_WORKSPACE = gql`
  mutation UpdateWorkspace($workspaceId: ID!, $name: String!) {
    updateWorkspace(input: { workspaceId: $workspaceId, name: $name }) {
      workspace {
        id
        ...WorkspaceFragment
      }
    }
  }
`;

export const DELETE_WORKSPACE = gql`
  mutation DeleteWorkspace($workspaceId: ID!) {
    deleteWorkspace(input: { workspaceId: $workspaceId }) {
      workspaceId
    }
  }
`;

export const ADD_MEMBER_TO_WORKSPACE = gql`
  mutation AddMemberToWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
    addMemberToWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId, role: $role }
    ) {
      workspace {
        id
        ...WorkspaceFragment
      }
    }
  }
`;

export const UPDATE_MEMBER_OF_WORKSPACE = gql`
  mutation UpdateMemberOfWorkspace(
    $workspaceId: ID!
    $userId: ID!
    $role: Role!
  ) {
    updateMemberOfWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId, role: $role }
    ) {
      workspace {
        id
        ...WorkspaceFragment
      }
    }
  }
`;

export const REMOVE_MEMBER_FROM_WORKSPACE = gql`
  mutation RemoveMemberFromWorkspace($workspaceId: ID!, $userId: ID!) {
    removeMemberFromWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId }
    ) {
      workspace {
        id
        ...WorkspaceFragment
      }
    }
  }
`;

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!) {
    createWorkspace(input: { name: $name }) {
      workspace {
        id
        ...WorkspaceFragment
      }
    }
  }
`;
