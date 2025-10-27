import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type CreateWebhookMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  url: Types.Scalars["URL"]["input"];
  active: Types.Scalars["Boolean"]["input"];
  trigger: Types.WebhookTriggerInput;
  secret: Types.Scalars["String"]["input"];
}>;

export type CreateWebhookMutation = {
  createWebhook: {
    __typename: "WebhookPayload";
    webhook: {
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
    };
  } | null;
};

export type UpdateWebhookMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
  webhookId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  url: Types.Scalars["URL"]["input"];
  active: Types.Scalars["Boolean"]["input"];
  trigger: Types.WebhookTriggerInput;
  secret?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type UpdateWebhookMutation = {
  updateWebhook: {
    __typename: "WebhookPayload";
    webhook: {
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
    };
  } | null;
};

export type DeleteWebhookMutationVariables = Types.Exact<{
  integrationId: Types.Scalars["ID"]["input"];
  webhookId: Types.Scalars["ID"]["input"];
}>;

export type DeleteWebhookMutation = {
  deleteWebhook: { __typename: "DeleteWebhookPayload"; webhookId: string } | null;
};

export const CreateWebhookDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateWebhook" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "url" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "URL" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "active" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "trigger" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "WebhookTriggerInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "secret" } },
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
            name: { kind: "Name", value: "createWebhook" },
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
                      name: { kind: "Name", value: "url" },
                      value: { kind: "Variable", name: { kind: "Name", value: "url" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "active" },
                      value: { kind: "Variable", name: { kind: "Name", value: "active" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "trigger" },
                      value: { kind: "Variable", name: { kind: "Name", value: "trigger" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "secret" },
                      value: { kind: "Variable", name: { kind: "Name", value: "secret" } },
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
                  name: { kind: "Name", value: "webhook" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
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
                      { kind: "Field", name: { kind: "Name", value: "secret" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
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
} as unknown as DocumentNode<CreateWebhookMutation, CreateWebhookMutationVariables>;
export const UpdateWebhookDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateWebhook" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "webhookId" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "url" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "URL" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "active" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "trigger" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "WebhookTriggerInput" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "secret" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateWebhook" },
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
                      name: { kind: "Name", value: "webhookId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "webhookId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "url" },
                      value: { kind: "Variable", name: { kind: "Name", value: "url" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "active" },
                      value: { kind: "Variable", name: { kind: "Name", value: "active" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "trigger" },
                      value: { kind: "Variable", name: { kind: "Name", value: "trigger" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "secret" },
                      value: { kind: "Variable", name: { kind: "Name", value: "secret" } },
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
                  name: { kind: "Name", value: "webhook" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "url" } },
                      { kind: "Field", name: { kind: "Name", value: "active" } },
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
                      { kind: "Field", name: { kind: "Name", value: "secret" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
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
} as unknown as DocumentNode<UpdateWebhookMutation, UpdateWebhookMutationVariables>;
export const DeleteWebhookDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteWebhook" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "webhookId" } },
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
            name: { kind: "Name", value: "deleteWebhook" },
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
                      name: { kind: "Name", value: "webhookId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "webhookId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "webhookId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteWebhookMutation, DeleteWebhookMutationVariables>;
