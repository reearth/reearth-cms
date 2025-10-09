import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetUserByNameOrEmailQueryVariables = Types.Exact<{
  nameOrEmail: Types.Scalars["String"]["input"];
}>;

export type GetUserByNameOrEmailQuery = {
  userByNameOrEmail: { __typename: "User"; id: string; name: string; email: string } | null;
};

export type GetUsersQueryVariables = Types.Exact<{
  keyword: Types.Scalars["String"]["input"];
}>;

export type GetUsersQuery = {
  userSearch: Array<{ __typename: "User"; id: string; name: string; email: string }>;
};

export type GetMeQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetMeQuery = {
  me: {
    __typename: "Me";
    id: string;
    name: string;
    email: string;
    lang: string;
    profilePictureUrl: string | null;
    auths: Array<string>;
    myWorkspace: { __typename: "Workspace"; id: string; name: string; alias: string | null } | null;
    workspaces: Array<{
      __typename: "Workspace";
      id: string;
      name: string;
      alias: string | null;
      members: Array<
        | {
            __typename: "WorkspaceIntegrationMember";
            integrationId: string;
            role: Types.Role;
            active: boolean;
            invitedById: string;
            integration: {
              __typename: "Integration";
              id: string;
              name: string;
              description: string | null;
              logoUrl: string;
              iType: Types.IntegrationType;
              developerId: string;
              createdAt: Date;
              updatedAt: Date;
              developer: { __typename: "User"; id: string; name: string; email: string };
              config: {
                __typename: "IntegrationConfig";
                token: string;
                webhooks: Array<{
                  __typename: "Webhook";
                  id: string;
                  name: string;
                  url: string;
                  active: boolean;
                  secret: string;
                  createdAt: Date;
                  updatedAt: Date;
                  trigger: {
                    __typename: "WebhookTrigger";
                    onItemCreate: boolean | null;
                    onItemUpdate: boolean | null;
                    onItemDelete: boolean | null;
                    onItemPublish: boolean | null;
                    onItemUnPublish: boolean | null;
                    onAssetUpload: boolean | null;
                    onAssetDecompress: boolean | null;
                    onAssetDelete: boolean | null;
                  };
                }>;
              } | null;
            } | null;
            invitedBy: { __typename: "User"; id: string; name: string; email: string } | null;
          }
        | {
            __typename: "WorkspaceUserMember";
            userId: string;
            role: Types.Role;
            user: { __typename: "User"; id: string; name: string; email: string } | null;
          }
      >;
    }>;
    integrations: Array<{
      __typename: "Integration";
      id: string;
      name: string;
      description: string | null;
      logoUrl: string;
      iType: Types.IntegrationType;
      developerId: string;
      createdAt: Date;
      updatedAt: Date;
      developer: { __typename: "User"; id: string; name: string; email: string };
      config: {
        __typename: "IntegrationConfig";
        token: string;
        webhooks: Array<{
          __typename: "Webhook";
          id: string;
          name: string;
          url: string;
          active: boolean;
          secret: string;
          createdAt: Date;
          updatedAt: Date;
          trigger: {
            __typename: "WebhookTrigger";
            onItemCreate: boolean | null;
            onItemUpdate: boolean | null;
            onItemDelete: boolean | null;
            onItemPublish: boolean | null;
            onItemUnPublish: boolean | null;
            onAssetUpload: boolean | null;
            onAssetDecompress: boolean | null;
            onAssetDelete: boolean | null;
          };
        }>;
      } | null;
    }>;
  } | null;
};

export type GetProfileQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetProfileQuery = {
  me: {
    __typename: "Me";
    id: string;
    name: string;
    email: string;
    lang: string;
    theme: Types.Theme;
    auths: Array<string>;
    myWorkspace: { __typename: "Workspace"; id: string; name: string; alias: string | null } | null;
  } | null;
};

export type GetLanguageQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetLanguageQuery = { me: { __typename: "Me"; id: string; lang: string } | null };

export type GetThemeQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetThemeQuery = { me: { __typename: "Me"; id: string; theme: Types.Theme } | null };

export type UpdateMeMutationVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  email?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  lang?: Types.InputMaybe<Types.Scalars["Lang"]["input"]>;
  theme?: Types.InputMaybe<Types.Theme>;
  password?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  passwordConfirmation?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type UpdateMeMutation = {
  updateMe: {
    __typename: "UpdateMePayload";
    me: {
      __typename: "Me";
      id: string;
      name: string;
      email: string;
      lang: string;
      theme: Types.Theme;
      myWorkspace: {
        __typename: "Workspace";
        id: string;
        name: string;
        alias: string | null;
      } | null;
    };
  } | null;
};

export type DeleteMeMutationVariables = Types.Exact<{
  userId: Types.Scalars["ID"]["input"];
}>;

export type DeleteMeMutation = {
  deleteMe: { __typename: "DeleteMePayload"; userId: string } | null;
};

export const GetUserByNameOrEmailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetUserByNameOrEmail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "nameOrEmail" } },
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
            name: { kind: "Name", value: "userByNameOrEmail" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "nameOrEmail" },
                value: { kind: "Variable", name: { kind: "Name", value: "nameOrEmail" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserByNameOrEmailQuery, GetUserByNameOrEmailQueryVariables>;
export const GetUsersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetUsers" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
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
            name: { kind: "Name", value: "userSearch" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "keyword" },
                value: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const GetMeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetMe" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "lang" } },
                { kind: "Field", name: { kind: "Name", value: "profilePictureUrl" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "myWorkspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "workspaces" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "members" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: { kind: "Name", value: "WorkspaceUserMember" },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "user" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
                                        { kind: "Field", name: { kind: "Name", value: "email" } },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "userId" } },
                                  { kind: "Field", name: { kind: "Name", value: "role" } },
                                ],
                              },
                            },
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: { kind: "Name", value: "WorkspaceIntegrationMember" },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "integrationId" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "integration" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "FragmentSpread",
                                          name: { kind: "Name", value: "integrationFragment" },
                                        },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "role" } },
                                  { kind: "Field", name: { kind: "Name", value: "active" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "invitedBy" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
                                        { kind: "Field", name: { kind: "Name", value: "email" } },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "invitedById" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "auths" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "integrations" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "integrationFragment" },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "integrationFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Integration" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "logoUrl" } },
          { kind: "Field", name: { kind: "Name", value: "iType" } },
          { kind: "Field", name: { kind: "Name", value: "developerId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "developer" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "config" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "token" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "webhooks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
                      { kind: "Field", name: { kind: "Name", value: "secret" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "trigger" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "onItemCreate" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemUpdate" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemDelete" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemPublish" } },
                            { kind: "Field", name: { kind: "Name", value: "onItemUnPublish" } },
                            { kind: "Field", name: { kind: "Name", value: "onAssetUpload" } },
                            { kind: "Field", name: { kind: "Name", value: "onAssetDecompress" } },
                            { kind: "Field", name: { kind: "Name", value: "onAssetDelete" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMeQuery, GetMeQueryVariables>;
export const GetProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProfile" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                { kind: "Field", name: { kind: "Name", value: "lang" } },
                { kind: "Field", name: { kind: "Name", value: "theme" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "myWorkspace" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "alias" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "auths" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetProfileQuery, GetProfileQueryVariables>;
export const GetLanguageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetLanguage" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "lang" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetLanguageQuery, GetLanguageQueryVariables>;
export const GetThemeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetTheme" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "theme" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetThemeQuery, GetThemeQueryVariables>;
export const UpdateMeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateMe" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "email" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "lang" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Lang" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "theme" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Theme" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "password" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "passwordConfirmation" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateMe" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "email" },
                      value: { kind: "Variable", name: { kind: "Name", value: "email" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "lang" },
                      value: { kind: "Variable", name: { kind: "Name", value: "lang" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "theme" },
                      value: { kind: "Variable", name: { kind: "Name", value: "theme" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "password" },
                      value: { kind: "Variable", name: { kind: "Name", value: "password" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "passwordConfirmation" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "passwordConfirmation" },
                      },
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
                  name: { kind: "Name", value: "me" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      { kind: "Field", name: { kind: "Name", value: "lang" } },
                      { kind: "Field", name: { kind: "Name", value: "theme" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "myWorkspace" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "alias" } },
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
} as unknown as DocumentNode<UpdateMeMutation, UpdateMeMutationVariables>;
export const DeleteMeDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteMe" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "userId" } },
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
            name: { kind: "Name", value: "deleteMe" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "userId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "userId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "userId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteMeMutation, DeleteMeMutationVariables>;
