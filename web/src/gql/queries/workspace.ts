import { gql } from "@apollo/client";

export const WORKSPACES = gql`
  fragment Workspace on Workspace {
    id
    name
    members {
      user {
        id
        name
        email
      }
      userId
      role
    }
    personal
  }

  query workspaces {
    me {
      id
      name
      myWorkspace {
        id
        ...Workspace
      }
      workspaces {
        id
        ...Workspace
      }
    }
  }
`;

export const UPDATE_WORKSPACE = gql`
  mutation updateWorkspace($workspaceId: ID!, $name: String!) {
    updateWorkspace(input: { workspaceId: $workspaceId, name: $name }) {
      workspace {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
        personal
      }
    }
  }
`;

export const DELETE_WORKSPACE = gql`
  mutation deleteWorkspace($workspaceId: ID!) {
    deleteWorkspace(input: { workspaceId: $workspaceId }) {
      workspaceId
    }
  }
`;

export const ADD_MEMBER_TO_WORKSPACE = gql`
  mutation addMemberToWorkspace($workspaceId: ID!, $userId: ID!, $role: Role!) {
    addMemberToWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId, role: $role }
    ) {
      workspace {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
        personal
      }
    }
  }
`;

export const UPDATE_MEMBER_OF_WORKSPACE = gql`
  mutation updateMemberOfWorkspace(
    $workspaceId: ID!
    $userId: ID!
    $role: Role!
  ) {
    updateMemberOfWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId, role: $role }
    ) {
      workspace {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
        personal
      }
    }
  }
`;

export const REMOVE_MEMBER_FROM_WORKSPACE = gql`
  mutation removeMemberFromWorkspace($workspaceId: ID!, $userId: ID!) {
    removeMemberFromWorkspace(
      input: { workspaceId: $workspaceId, userId: $userId }
    ) {
      workspace {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
        personal
      }
    }
  }
`;

export const CREATE_WORKSPACE = gql`
  mutation createWorkspace($name: String!) {
    createWorkspace(input: { name: $name }) {
      workspace {
        id
        name
        members {
          user {
            id
            name
            email
          }
          userId
          role
        }
        personal
      }
    }
  }
`;
