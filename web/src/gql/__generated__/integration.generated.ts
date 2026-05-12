import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type IntegrationFragmentFragment = {
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
};

export type CreateIntegrationMutationVariables = Types.Exact<{
  name: Types.Scalars["String"]["input"];
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  logoUrl: Types.Scalars["URL"]["input"];
  type: Types.IntegrationType;
}>;

export type CreateIntegrationMutation = {
  createIntegration: {
    __typename: "IntegrationPayload";
    integration: {
      __typename: "Integration";
      id: string;
      name: string;
      description: string | null;
      logoUrl: string;
      iType: Types.IntegrationType;
    };
  } | null;
};

export type UpdateIntegrationMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  logoUrl: Types.Scalars["URL"]["input"];
}>;

export type UpdateIntegrationMutation = {
  updateIntegration: {
    __typename: "IntegrationPayload";
    integration: {
      __typename: "Integration";
      id: string;
      name: string;
      description: string | null;
      logoUrl: string;
      iType: Types.IntegrationType;
    };
  } | null;
};

export type DeleteIntegrationMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
}>;

export type DeleteIntegrationMutation = {
  deleteIntegration: { __typename: "DeleteIntegrationPayload"; integrationId: string } | null;
};

export type RegenerateIntegrationTokenMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
}>;

export type RegenerateIntegrationTokenMutation = {
  regenerateIntegrationToken: {
    __typename: "IntegrationPayload";
    integration: {
      __typename: "Integration";
      id: string;
      name: string;
      description: string | null;
      logoUrl: string;
      iType: Types.IntegrationType;
    };
  } | null;
};

export const IntegrationFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
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
} as unknown as DocumentNode<IntegrationFragmentFragment, unknown>;
export const CreateIntegrationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateIntegration" },
      variableDefinitions: [
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
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "logoUrl" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "URL" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "type" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "IntegrationType" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createIntegration" },
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
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "logoUrl" },
                      value: { kind: "Variable", name: { kind: "Name", value: "logoUrl" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "Variable", name: { kind: "Name", value: "type" } },
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
                  name: { kind: "Name", value: "integration" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "logoUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "iType" } },
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
} as unknown as DocumentNode<CreateIntegrationMutation, CreateIntegrationMutationVariables>;
export const UpdateIntegrationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateIntegration" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
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
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "logoUrl" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "URL" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateIntegration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integrationId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
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
                      name: { kind: "Name", value: "logoUrl" },
                      value: { kind: "Variable", name: { kind: "Name", value: "logoUrl" } },
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
                  name: { kind: "Name", value: "integration" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "logoUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "iType" } },
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
} as unknown as DocumentNode<UpdateIntegrationMutation, UpdateIntegrationMutationVariables>;
export const DeleteIntegrationDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteIntegration" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
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
            name: { kind: "Name", value: "deleteIntegration" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integrationId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "integrationId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteIntegrationMutation, DeleteIntegrationMutationVariables>;
export const RegenerateIntegrationTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "regenerateIntegrationToken" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
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
            name: { kind: "Name", value: "regenerateIntegrationToken" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "integrationId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "integrationId" } },
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
                  name: { kind: "Name", value: "integration" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "logoUrl" } },
                      { kind: "Field", name: { kind: "Name", value: "iType" } },
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
} as unknown as DocumentNode<
  RegenerateIntegrationTokenMutation,
  RegenerateIntegrationTokenMutationVariables
>;
