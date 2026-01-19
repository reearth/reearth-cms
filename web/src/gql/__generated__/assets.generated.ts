import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetAssetsQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  keyword?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  sort?: Types.InputMaybe<Types.AssetSort>;
  pagination?: Types.InputMaybe<Types.Pagination>;
  contentTypes?: Types.InputMaybe<Array<Types.ContentTypesEnum> | Types.ContentTypesEnum>;
}>;

export type GetAssetsQuery = {
  assets: {
    __typename: "AssetConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Asset";
      id: string;
      fileName: string;
      projectId: string;
      createdAt: Date;
      size: number;
      previewType: Types.PreviewType | null;
      uuid: string;
      url: string;
      archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
      public: boolean;
      createdBy:
        | {
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
          }
        | { __typename: "User"; id: string; name: string; email: string };
      thread: {
        __typename: "Thread";
        id: string;
        workspaceId: string;
        comments: Array<{
          __typename: "Comment";
          id: string;
          authorId: string;
          content: string;
          createdAt: Date;
          author:
            | { __typename: "Integration"; id: string; name: string }
            | { __typename: "User"; id: string; name: string; email: string }
            | null;
        }>;
      } | null;
    } | null>;
    pageInfo: {
      __typename: "PageInfo";
      startCursor: string | null;
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type GetAssetsItemsQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  keyword?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  sort?: Types.InputMaybe<Types.AssetSort>;
  pagination?: Types.InputMaybe<Types.Pagination>;
  contentTypes?: Types.InputMaybe<Array<Types.ContentTypesEnum> | Types.ContentTypesEnum>;
}>;

export type GetAssetsItemsQuery = {
  assets: {
    __typename: "AssetConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Asset";
      id: string;
      fileName: string;
      projectId: string;
      createdAt: Date;
      size: number;
      previewType: Types.PreviewType | null;
      uuid: string;
      url: string;
      archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
      public: boolean;
      items: Array<{ __typename: "AssetItem"; itemId: string; modelId: string }> | null;
      createdBy:
        | {
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
          }
        | { __typename: "User"; id: string; name: string; email: string };
      thread: {
        __typename: "Thread";
        id: string;
        workspaceId: string;
        comments: Array<{
          __typename: "Comment";
          id: string;
          authorId: string;
          content: string;
          createdAt: Date;
          author:
            | { __typename: "Integration"; id: string; name: string }
            | { __typename: "User"; id: string; name: string; email: string }
            | null;
        }>;
      } | null;
    } | null>;
    pageInfo: {
      __typename: "PageInfo";
      startCursor: string | null;
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
};

export type GetAssetQueryVariables = Types.Exact<{
  assetId: Types.Scalars["ID"]["input"];
}>;

export type GetAssetQuery = {
  node:
    | {
        __typename: "Asset";
        id: string;
        fileName: string;
        projectId: string;
        createdAt: Date;
        size: number;
        previewType: Types.PreviewType | null;
        uuid: string;
        url: string;
        archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
        public: boolean;
        createdBy:
          | {
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
            }
          | { __typename: "User"; id: string; name: string; email: string };
        thread: {
          __typename: "Thread";
          id: string;
          workspaceId: string;
          comments: Array<{
            __typename: "Comment";
            id: string;
            authorId: string;
            content: string;
            createdAt: Date;
            author:
              | { __typename: "Integration"; id: string; name: string }
              | { __typename: "User"; id: string; name: string; email: string }
              | null;
          }>;
        } | null;
      }
    | { __typename: "Group" }
    | { __typename: "Integration" }
    | { __typename: "Item" }
    | { __typename: "Model" }
    | { __typename: "Project" }
    | { __typename: "Request" }
    | { __typename: "Schema" }
    | { __typename: "User" }
    | { __typename: "View" }
    | { __typename: "Workspace" }
    | { __typename: "WorkspaceSettings" }
    | null;
};

export type GetAssetFileQueryVariables = Types.Exact<{
  assetId: Types.Scalars["ID"]["input"];
}>;

export type GetAssetFileQuery = {
  assetFile: {
    __typename: "AssetFile";
    name: string;
    path: string;
    filePaths: Array<string> | null;
  };
};

export type GetAssetItemQueryVariables = Types.Exact<{
  assetId: Types.Scalars["ID"]["input"];
}>;

export type GetAssetItemQuery = {
  node:
    | {
        __typename: "Asset";
        id: string;
        fileName: string;
        projectId: string;
        createdAt: Date;
        size: number;
        previewType: Types.PreviewType | null;
        uuid: string;
        url: string;
        archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
        public: boolean;
        items: Array<{ __typename: "AssetItem"; itemId: string; modelId: string }> | null;
        createdBy:
          | {
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
            }
          | { __typename: "User"; id: string; name: string; email: string };
        thread: {
          __typename: "Thread";
          id: string;
          workspaceId: string;
          comments: Array<{
            __typename: "Comment";
            id: string;
            authorId: string;
            content: string;
            createdAt: Date;
            author:
              | { __typename: "Integration"; id: string; name: string }
              | { __typename: "User"; id: string; name: string; email: string }
              | null;
          }>;
        } | null;
      }
    | { __typename: "Group" }
    | { __typename: "Integration" }
    | { __typename: "Item" }
    | { __typename: "Model" }
    | { __typename: "Project" }
    | { __typename: "Request" }
    | { __typename: "Schema" }
    | { __typename: "User" }
    | { __typename: "View" }
    | { __typename: "Workspace" }
    | { __typename: "WorkspaceSettings" }
    | null;
};

export type GuessSchemaFieldsQueryVariables = Types.Exact<{
  assetId: Types.Scalars["ID"]["input"];
  modelId: Types.Scalars["ID"]["input"];
}>;

export type GuessSchemaFieldsQuery = {
  guessSchemaFields: {
    __typename: "GuessSchemaFieldResult";
    total_count: number;
    fields: Array<{ __typename: "GuessSchemaField"; name: string; type: string }>;
  };
};

export type CreateAssetMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  file?: Types.InputMaybe<Types.Scalars["Upload"]["input"]>;
  token?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  url?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  skipDecompression?: Types.InputMaybe<Types.Scalars["Boolean"]["input"]>;
}>;

export type CreateAssetMutation = {
  createAsset: {
    __typename: "CreateAssetPayload";
    asset: {
      __typename: "Asset";
      id: string;
      fileName: string;
      projectId: string;
      createdAt: Date;
      size: number;
      previewType: Types.PreviewType | null;
      uuid: string;
      url: string;
      archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
      public: boolean;
      createdBy:
        | {
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
          }
        | { __typename: "User"; id: string; name: string; email: string };
      thread: {
        __typename: "Thread";
        id: string;
        workspaceId: string;
        comments: Array<{
          __typename: "Comment";
          id: string;
          authorId: string;
          content: string;
          createdAt: Date;
          author:
            | { __typename: "Integration"; id: string; name: string }
            | { __typename: "User"; id: string; name: string; email: string }
            | null;
        }>;
      } | null;
    };
  } | null;
};

export type UpdateAssetMutationVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
  previewType?: Types.InputMaybe<Types.PreviewType>;
}>;

export type UpdateAssetMutation = {
  updateAsset: {
    __typename: "UpdateAssetPayload";
    asset: {
      __typename: "Asset";
      id: string;
      fileName: string;
      projectId: string;
      createdAt: Date;
      size: number;
      previewType: Types.PreviewType | null;
      uuid: string;
      url: string;
      archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
      public: boolean;
      createdBy:
        | {
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
          }
        | { __typename: "User"; id: string; name: string; email: string };
      thread: {
        __typename: "Thread";
        id: string;
        workspaceId: string;
        comments: Array<{
          __typename: "Comment";
          id: string;
          authorId: string;
          content: string;
          createdAt: Date;
          author:
            | { __typename: "Integration"; id: string; name: string }
            | { __typename: "User"; id: string; name: string; email: string }
            | null;
        }>;
      } | null;
    };
  } | null;
};

export type DeleteAssetMutationVariables = Types.Exact<{
  assetId: Types.Scalars["ID"]["input"];
}>;

export type DeleteAssetMutation = {
  deleteAsset: { __typename: "DeleteAssetPayload"; assetId: string } | null;
};

export type DeleteAssetsMutationVariables = Types.Exact<{
  assetIds: Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"];
}>;

export type DeleteAssetsMutation = {
  deleteAssets: { __typename: "DeleteAssetsPayload"; assetIds: Array<string> | null } | null;
};

export type DecompressAssetMutationVariables = Types.Exact<{
  assetId: Types.Scalars["ID"]["input"];
}>;

export type DecompressAssetMutation = {
  decompressAsset: {
    __typename: "DecompressAssetPayload";
    asset: {
      __typename: "Asset";
      id: string;
      fileName: string;
      projectId: string;
      createdAt: Date;
      size: number;
      previewType: Types.PreviewType | null;
      uuid: string;
      url: string;
      archiveExtractionStatus: Types.ArchiveExtractionStatus | null;
      public: boolean;
      createdBy:
        | {
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
          }
        | { __typename: "User"; id: string; name: string; email: string };
      thread: {
        __typename: "Thread";
        id: string;
        workspaceId: string;
        comments: Array<{
          __typename: "Comment";
          id: string;
          authorId: string;
          content: string;
          createdAt: Date;
          author:
            | { __typename: "Integration"; id: string; name: string }
            | { __typename: "User"; id: string; name: string; email: string }
            | null;
        }>;
      } | null;
    };
  } | null;
};

export type CreateAssetUploadMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  filename: Types.Scalars["String"]["input"];
  cursor: Types.Scalars["String"]["input"];
  contentLength: Types.Scalars["Int"]["input"];
  contentEncoding?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type CreateAssetUploadMutation = {
  createAssetUpload: {
    __typename: "CreateAssetUploadPayload";
    url: string;
    token: string;
    contentType: string | null;
    contentLength: number;
    contentEncoding: string | null;
    next: string | null;
  } | null;
};

export const GetAssetsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAssets" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "AssetSort" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Pagination" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentTypes" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ContentTypesEnum" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assets" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "query" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "project" },
                            value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "keyword" },
                            value: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "contentTypes" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "contentTypes" },
                            },
                          },
                        ],
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "pagination" },
                      value: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
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
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "startCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "hasPreviousPage" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssetsQuery, GetAssetsQueryVariables>;
export const GetAssetsItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAssetsItems" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "AssetSort" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Pagination" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentTypes" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ContentTypesEnum" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "assets" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "query" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "project" },
                            value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "keyword" },
                            value: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
                          },
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "contentTypes" },
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "contentTypes" },
                            },
                          },
                        ],
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "pagination" },
                      value: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
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
                  name: { kind: "Name", value: "nodes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "itemId" } },
                            { kind: "Field", name: { kind: "Name", value: "modelId" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "startCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "hasPreviousPage" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssetsItemsQuery, GetAssetsItemsQueryVariables>;
export const GetAssetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAsset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "ASSET" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssetQuery, GetAssetQueryVariables>;
export const GetAssetFileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAssetFile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
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
            name: { kind: "Name", value: "assetFile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "assetId" },
                value: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "assetFileFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFileFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "AssetFile" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "path" } },
          { kind: "Field", name: { kind: "Name", value: "filePaths" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssetFileQuery, GetAssetFileQueryVariables>;
export const GetAssetItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetAssetItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "ASSET" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "itemId" } },
                            { kind: "Field", name: { kind: "Name", value: "modelId" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssetItemQuery, GetAssetItemQueryVariables>;
export const GuessSchemaFieldsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GuessSchemaFields" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
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
            name: { kind: "Name", value: "guessSchemaFields" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "assetId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "modelId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "total_count" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fields" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
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
} as unknown as DocumentNode<GuessSchemaFieldsQuery, GuessSchemaFieldsQueryVariables>;
export const CreateAssetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateAsset" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "file" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Upload" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "token" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "url" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "skipDecompression" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createAsset" },
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
                      name: { kind: "Name", value: "file" },
                      value: { kind: "Variable", name: { kind: "Name", value: "file" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "token" },
                      value: { kind: "Variable", name: { kind: "Name", value: "token" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "url" },
                      value: { kind: "Variable", name: { kind: "Name", value: "url" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "skipDecompression" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "skipDecompression" },
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
                  name: { kind: "Name", value: "asset" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateAssetMutation, CreateAssetMutationVariables>;
export const UpdateAssetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateAsset" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "previewType" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "PreviewType" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateAsset" },
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
                      name: { kind: "Name", value: "previewType" },
                      value: { kind: "Variable", name: { kind: "Name", value: "previewType" } },
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
                  name: { kind: "Name", value: "asset" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAssetMutation, UpdateAssetMutationVariables>;
export const DeleteAssetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteAsset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
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
            name: { kind: "Name", value: "deleteAsset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "assetId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "assetId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAssetMutation, DeleteAssetMutationVariables>;
export const DeleteAssetsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteAssets" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetIds" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteAssets" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "assetIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "assetIds" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "assetIds" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAssetsMutation, DeleteAssetsMutationVariables>;
export const DecompressAssetDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DecompressAsset" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
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
            name: { kind: "Name", value: "decompressAsset" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "assetId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "assetId" } },
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
                  name: { kind: "Name", value: "asset" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "assetFragment" } },
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
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "threadFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Thread" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Integration" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "authorId" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "assetFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Asset" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "fileName" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "User" } },
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
                  kind: "InlineFragment",
                  typeCondition: {
                    kind: "NamedType",
                    name: { kind: "Name", value: "Integration" },
                  },
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
          { kind: "Field", name: { kind: "Name", value: "size" } },
          { kind: "Field", name: { kind: "Name", value: "previewType" } },
          { kind: "Field", name: { kind: "Name", value: "uuid" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "thread" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "threadFragment" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "archiveExtractionStatus" } },
          { kind: "Field", name: { kind: "Name", value: "public" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DecompressAssetMutation, DecompressAssetMutationVariables>;
export const CreateAssetUploadDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateAssetUpload" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "filename" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "cursor" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentLength" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "contentEncoding" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createAssetUpload" },
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
                      name: { kind: "Name", value: "filename" },
                      value: { kind: "Variable", name: { kind: "Name", value: "filename" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "cursor" },
                      value: { kind: "Variable", name: { kind: "Name", value: "cursor" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "contentLength" },
                      value: { kind: "Variable", name: { kind: "Name", value: "contentLength" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "contentEncoding" },
                      value: { kind: "Variable", name: { kind: "Name", value: "contentEncoding" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "url" } },
                { kind: "Field", name: { kind: "Name", value: "token" } },
                { kind: "Field", name: { kind: "Name", value: "contentType" } },
                { kind: "Field", name: { kind: "Name", value: "contentLength" } },
                { kind: "Field", name: { kind: "Name", value: "contentEncoding" } },
                { kind: "Field", name: { kind: "Name", value: "next" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateAssetUploadMutation, CreateAssetUploadMutationVariables>;
