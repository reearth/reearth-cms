import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects(
    $workspaceId: ID!
    $first: Int
    $last: Int
    $after: Cursor
    $before: Cursor
  ) {
    projects(
      workspaceId: $workspaceId
      first: $first
      last: $last
      after: $after
      before: $before
    ) {
      nodes {
        id
        name
        description
        alias
      }
    }
  }
`;

export const CHECK_PROJECT_ALIAS = gql`
  query CheckProjectAlias($alias: String!) {
    checkProjectAlias(alias: $alias) {
      alias
      available
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $workspaceId: ID!
    $name: String!
    $description: String!
  ) {
    createProject(
      input: {
        workspaceId: $workspaceId
        name: $name
        description: $description
      }
    ) {
      project {
        id
        name
        description
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!) {
    deleteProject(input: { projectId: $projectId }) {
      projectId
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($projectId: ID!, $name: String, $description: String) {
    updateProject(
      input: { projectId: $projectId, name: $name, description: $description }
    ) {
      project {
        id
        name
        description
        alias
      }
    }
  }
`;
