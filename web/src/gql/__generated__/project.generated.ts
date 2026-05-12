import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetProjectQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
}>;

export type GetProjectQuery = {
  node:
    | { __typename: "Asset"; id: string }
    | { __typename: "Group"; id: string }
    | { __typename: "Integration"; id: string }
    | { __typename: "Item"; id: string }
    | { __typename: "Job"; id: string }
    | { __typename: "Model"; id: string }
    | {
        __typename: "Project";
        name: string;
        description: string;
        alias: string;
        license: string;
        readme: string;
        requestRoles: Array<Types.Role> | null;
        id: string;
        accessibility: {
          __typename: "ProjectAccessibility";
          visibility: Types.ProjectVisibility;
          publication: {
            __typename: "PublicationSettings";
            publicModels: Array<string>;
            publicAssets: boolean;
          } | null;
          apiKeys: Array<{
            __typename: "ProjectAPIKey";
            id: string;
            name: string;
            description: string;
            key: string;
            publication: {
              __typename: "PublicationSettings";
              publicModels: Array<string>;
              publicAssets: boolean;
            };
          }> | null;
        };
      }
    | { __typename: "Request"; id: string }
    | { __typename: "Schema"; id: string }
    | { __typename: "User"; id: string }
    | { __typename: "View"; id: string }
    | { __typename: "Workspace"; id: string }
    | { __typename: "WorkspaceSettings"; id: string }
    | null;
};

export type GetProjectsQueryVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  keyword?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  sort?: Types.InputMaybe<Types.Sort>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;

export type GetProjectsQuery = {
  projects: {
    __typename: "ProjectConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Project";
      id: string;
      name: string;
      description: string;
      alias: string;
      license: string;
      readme: string;
      createdAt: Date;
      updatedAt: Date;
      requestRoles: Array<Types.Role> | null;
      accessibility: {
        __typename: "ProjectAccessibility";
        visibility: Types.ProjectVisibility;
        publication: {
          __typename: "PublicationSettings";
          publicModels: Array<string>;
          publicAssets: boolean;
        } | null;
        apiKeys: Array<{
          __typename: "ProjectAPIKey";
          id: string;
          name: string;
          description: string;
          key: string;
          publication: {
            __typename: "PublicationSettings";
            publicModels: Array<string>;
            publicAssets: boolean;
          };
        }> | null;
      };
    } | null>;
  };
};

export type CheckProjectAliasQueryVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  alias: Types.Scalars["String"]["input"];
}>;

export type CheckProjectAliasQuery = {
  checkProjectAlias: { __typename: "ProjectAliasAvailability"; alias: string; available: boolean };
};

export type CheckProjectLimitsQueryVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
}>;

export type CheckProjectLimitsQuery = {
  checkWorkspaceProjectLimits: {
    __typename: "WorkspaceProjectLimits";
    publicProjectsAllowed: boolean;
    privateProjectsAllowed: boolean;
  };
};

export type CreateProjectMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  description: Types.Scalars["String"]["input"];
  alias: Types.Scalars["String"]["input"];
  license?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  visibility?: Types.InputMaybe<Types.ProjectVisibility>;
  requestRoles?: Types.InputMaybe<Array<Types.Role> | Types.Role>;
}>;

export type CreateProjectMutation = {
  createProject: {
    __typename: "ProjectPayload";
    project: {
      __typename: "Project";
      id: string;
      name: string;
      description: string;
      alias: string;
      license: string;
      requestRoles: Array<Types.Role> | null;
      accessibility: {
        __typename: "ProjectAccessibility";
        visibility: Types.ProjectVisibility;
        publication: {
          __typename: "PublicationSettings";
          publicModels: Array<string>;
          publicAssets: boolean;
        } | null;
        apiKeys: Array<{
          __typename: "ProjectAPIKey";
          id: string;
          name: string;
          description: string;
          key: string;
          publication: {
            __typename: "PublicationSettings";
            publicModels: Array<string>;
            publicAssets: boolean;
          };
        }> | null;
      };
    };
  } | null;
};

export type DeleteProjectMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
}>;

export type DeleteProjectMutation = {
  deleteProject: { __typename: "DeleteProjectPayload"; projectId: string } | null;
};

export type UpdateProjectMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  name?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  alias?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  license?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  readme?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  accessibility?: Types.InputMaybe<Types.UpdateProjectAccessibilityInput>;
  requestRoles?: Types.InputMaybe<Array<Types.Role> | Types.Role>;
}>;

export type UpdateProjectMutation = {
  updateProject: {
    __typename: "ProjectPayload";
    project: {
      __typename: "Project";
      id: string;
      name: string;
      description: string;
      alias: string;
      license: string;
      readme: string;
      requestRoles: Array<Types.Role> | null;
      accessibility: {
        __typename: "ProjectAccessibility";
        visibility: Types.ProjectVisibility;
        publication: {
          __typename: "PublicationSettings";
          publicModels: Array<string>;
          publicAssets: boolean;
        } | null;
        apiKeys: Array<{
          __typename: "ProjectAPIKey";
          id: string;
          name: string;
          description: string;
          key: string;
          publication: {
            __typename: "PublicationSettings";
            publicModels: Array<string>;
            publicAssets: boolean;
          };
        }> | null;
      };
    };
  } | null;
};

export type CreateApiKeyMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  description: Types.Scalars["String"]["input"];
  publication: Types.UpdatePublicationSettingsInput;
}>;

export type CreateApiKeyMutation = {
  createAPIKey: {
    __typename: "APIKeyPayload";
    apiKey: {
      __typename: "ProjectAPIKey";
      id: string;
      name: string;
      description: string;
      key: string;
      publication: {
        __typename: "PublicationSettings";
        publicModels: Array<string>;
        publicAssets: boolean;
      };
    };
  } | null;
};

export type UpdateApiKeyMutationVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
  projectId: Types.Scalars["ID"]["input"];
  name?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  publication?: Types.InputMaybe<Types.UpdatePublicationSettingsInput>;
}>;

export type UpdateApiKeyMutation = {
  updateAPIKey: {
    __typename: "APIKeyPayload";
    apiKey: {
      __typename: "ProjectAPIKey";
      id: string;
      name: string;
      description: string;
      key: string;
      publication: {
        __typename: "PublicationSettings";
        publicModels: Array<string>;
        publicAssets: boolean;
      };
    };
  } | null;
};

export type DeleteApiKeyMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  id: Types.Scalars["ID"]["input"];
}>;

export type DeleteApiKeyMutation = {
  deleteAPIKey: { __typename: "DeleteAPIKeyPayload"; apiKeyId: string } | null;
};

export type RegenerateApiKeyMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  id: Types.Scalars["ID"]["input"];
}>;

export type RegenerateApiKeyMutation = {
  regenerateAPIKey: {
    __typename: "APIKeyPayload";
    apiKey: {
      __typename: "ProjectAPIKey";
      id: string;
      name: string;
      description: string;
      key: string;
      publication: {
        __typename: "PublicationSettings";
        publicModels: Array<string>;
        publicAssets: boolean;
      };
    };
  } | null;
};

export const GetProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "node" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "PROJECT" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Project" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                      { kind: "Field", name: { kind: "Name", value: "license" } },
                      { kind: "Field", name: { kind: "Name", value: "readme" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accessibility" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "publication" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                                  { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "apiKeys" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "description" } },
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "publication" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicModels" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicAssets" },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "requestRoles" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetProjectQuery, GetProjectQueryVariables>;
export const GetProjectsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProjects" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Sort" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Pagination" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "projects" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "workspaceId" },
                value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "keyword" },
                value: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sort" },
                value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pagination" },
                value: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                      { kind: "Field", name: { kind: "Name", value: "license" } },
                      { kind: "Field", name: { kind: "Name", value: "readme" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accessibility" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "publication" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                                  { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "apiKeys" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "description" } },
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "publication" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicModels" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicAssets" },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "requestRoles" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetProjectsQuery, GetProjectsQueryVariables>;
export const CheckProjectAliasDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CheckProjectAlias" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "alias" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "checkProjectAlias" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "workspaceId" },
                value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "alias" },
                value: { kind: "Variable", name: { kind: "Name", value: "alias" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "alias" } },
                { kind: "Field", name: { kind: "Name", value: "available" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CheckProjectAliasQuery, CheckProjectAliasQueryVariables>;
export const CheckProjectLimitsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CheckProjectLimits" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "checkWorkspaceProjectLimits" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "workspaceId" },
                value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "publicProjectsAllowed" } },
                { kind: "Field", name: { kind: "Name", value: "privateProjectsAllowed" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CheckProjectLimitsQuery, CheckProjectLimitsQueryVariables>;
export const CreateProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "alias" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "license" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "visibility" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ProjectVisibility" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestRoles" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "Role" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workspaceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "workspaceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "alias" },
                      value: { kind: "Variable", name: { kind: "Name", value: "alias" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "license" },
                      value: { kind: "Variable", name: { kind: "Name", value: "license" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "visibility" },
                      value: { kind: "Variable", name: { kind: "Name", value: "visibility" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "requestRoles" },
                      value: { kind: "Variable", name: { kind: "Name", value: "requestRoles" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "project" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                      { kind: "Field", name: { kind: "Name", value: "license" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accessibility" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "publication" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                                  { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "apiKeys" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "description" } },
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "publication" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicModels" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicAssets" },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "requestRoles" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateProjectMutation, CreateProjectMutationVariables>;
export const DeleteProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "projectId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "projectId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const UpdateProjectDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateProject" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "alias" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "license" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "readme" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "accessibility" } },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "UpdateProjectAccessibilityInput" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestRoles" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "Role" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateProject" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "projectId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "alias" },
                      value: { kind: "Variable", name: { kind: "Name", value: "alias" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "license" },
                      value: { kind: "Variable", name: { kind: "Name", value: "license" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "readme" },
                      value: { kind: "Variable", name: { kind: "Name", value: "readme" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "accessibility" },
                      value: { kind: "Variable", name: { kind: "Name", value: "accessibility" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "requestRoles" },
                      value: { kind: "Variable", name: { kind: "Name", value: "requestRoles" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "project" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                      { kind: "Field", name: { kind: "Name", value: "license" } },
                      { kind: "Field", name: { kind: "Name", value: "readme" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "accessibility" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "visibility" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "publication" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                                  { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "apiKeys" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "description" } },
                                  { kind: "Field", name: { kind: "Name", value: "key" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "publication" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicModels" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "publicAssets" },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "requestRoles" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateProjectMutation, UpdateProjectMutationVariables>;
export const CreateApiKeyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateAPIKey" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "publication" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "UpdatePublicationSettingsInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createAPIKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "projectId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "publication" },
                      value: { kind: "Variable", name: { kind: "Name", value: "publication" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "apiKey" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "publication" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                            { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateApiKeyMutation, CreateApiKeyMutationVariables>;
export const UpdateApiKeyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateAPIKey" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "publication" } },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "UpdatePublicationSettingsInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateAPIKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "id" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "projectId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "publication" },
                      value: { kind: "Variable", name: { kind: "Name", value: "publication" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "apiKey" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "publication" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                            { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateApiKeyMutation, UpdateApiKeyMutationVariables>;
export const DeleteApiKeyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteAPIKey" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteAPIKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "projectId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "id" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "apiKeyId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteApiKeyMutation, DeleteApiKeyMutationVariables>;
export const RegenerateApiKeyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RegenerateAPIKey" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "regenerateAPIKey" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "projectId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "id" },
                      value: { kind: "Variable", name: { kind: "Name", value: "id" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "apiKey" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "publication" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "publicModels" } },
                            { kind: "Field", name: { kind: "Name", value: "publicAssets" } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegenerateApiKeyMutation, RegenerateApiKeyMutationVariables>;
