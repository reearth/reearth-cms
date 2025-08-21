import { gql } from "@apollo/client";

export const GET_PROJECT = gql`
  query GetProject($projectId: ID!) {
    node(id: $projectId, type: PROJECT) {
      id
      ... on Project {
        name
        description
        alias
        license
        readme
        accessibility {
          visibility
          publication {
            publicModels
            publicAssets
          }
          apiKeys {
            id
            name
            description
            key
            publication {
              publicModels
              publicAssets
            }
          }
        }
        requestRoles
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects($workspaceId: ID!, $keyword: String, $sort: Sort, $pagination: Pagination) {
    projects(workspaceId: $workspaceId, keyword: $keyword, sort: $sort, pagination: $pagination) {
      nodes {
        id
        name
        description
        alias
        license
        readme
        createdAt
        updatedAt
        accessibility {
          visibility
          publication {
            publicModels
            publicAssets
          }
          apiKeys {
            id
            name
            description
            key
            publication {
              publicModels
              publicAssets
            }
          }
        }
        requestRoles
      }
      totalCount
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

export const CHECK_PROJECT_LIMITS = gql`
  query CheckProjectLimits($workspaceId: ID!) {
    checkWorkspaceProjectLimits(workspaceId: $workspaceId) {
      publicProjectsAllowed
      privateProjectsAllowed
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $workspaceId: ID!
    $name: String!
    $description: String!
    $alias: String!
    $license: String
    $visibility: ProjectVisibility
    $requestRoles: [Role!]
  ) {
    createProject(
      input: {
        workspaceId: $workspaceId
        name: $name
        description: $description
        alias: $alias
        license: $license
        visibility: $visibility
        requestRoles: $requestRoles
      }
    ) {
      project {
        id
        name
        description
        alias
        license
        accessibility {
          visibility
          publication {
            publicModels
            publicAssets
          }
          apiKeys {
            id
            name
            description
            key
            publication {
              publicModels
              publicAssets
            }
          }
        }
        requestRoles
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
  mutation UpdateProject(
    $projectId: ID!
    $name: String
    $description: String
    $alias: String
    $license: String
    $readme: String
    $accessibility: UpdateProjectAccessibilityInput
    $requestRoles: [Role!]
  ) {
    updateProject(
      input: {
        projectId: $projectId
        name: $name
        description: $description
        alias: $alias
        license: $license
        readme: $readme
        accessibility: $accessibility
        requestRoles: $requestRoles
      }
    ) {
      project {
        id
        name
        description
        alias
        license
        readme
        accessibility {
          visibility
          publication {
            publicModels
            publicAssets
          }
          apiKeys {
            id
            name
            description
            key
            publication {
              publicModels
              publicAssets
            }
          }
        }
        requestRoles
      }
    }
  }
`;

export const CREATE_API_KEY = gql`
  mutation CreateAPIKey(
    $projectId: ID!
    $name: String!
    $description: String!
    $publication: UpdatePublicationSettingsInput!
  ) {
    createAPIKey(
      input: {
        projectId: $projectId
        name: $name
        description: $description
        publication: $publication
      }
    ) {
      apiKey {
        id
        name
        description
        key
        publication {
          publicModels
          publicAssets
        }
      }
      public {
        publicModels
        publicAssets
      }
    }
  }
`;

export const UPDATE_API_KEY = gql`
  mutation UpdateAPIKey(
    $id: ID!
    $projectId: ID!
    $name: String
    $description: String
    $publication: UpdatePublicationSettingsInput
  ) {
    updateAPIKey(
      input: {
        id: $id
        projectId: $projectId
        name: $name
        description: $description
        publication: $publication
      }
    ) {
      apiKey {
        id
        name
        description
        key
        publication {
          publicModels
          publicAssets
        }
      }
      public {
        publicModels
        publicAssets
      }
    }
  }
`;

export const DELETE_API_KEY = gql`
  mutation DeleteAPIKey($projectId: ID!, $id: ID!) {
    deleteAPIKey(input: { projectId: $projectId, id: $id }) {
      apiKeyId
    }
  }
`;

export const REGENERATE_API_KEY = gql`
  mutation RegenerateAPIKey($projectId: ID!, $id: ID!) {
    regenerateAPIKey(input: { projectId: $projectId, id: $id }) {
      apiKey {
        id
        name
        description
        key
        publication {
          publicModels
          publicAssets
        }
      }
      public {
        publicModels
        publicAssets
      }
    }
  }
`;
