import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetRequestsQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  key?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  state?: Types.InputMaybe<Array<Types.RequestState> | Types.RequestState>;
  pagination?: Types.InputMaybe<Types.Pagination>;
  createdBy?: Types.InputMaybe<Types.Scalars["ID"]["input"]>;
  reviewer?: Types.InputMaybe<Types.Scalars["ID"]["input"]>;
  sort?: Types.InputMaybe<Types.Sort>;
}>;

export type GetRequestsQuery = {
  requests: {
    __typename: "RequestConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Request";
      id: string;
      title: string;
      description: string | null;
      workspaceId: string;
      projectId: string;
      threadId: string | null;
      reviewersId: Array<string>;
      state: Types.RequestState;
      createdAt: Date;
      updatedAt: Date;
      approvedAt: Date | null;
      closedAt: Date | null;
      createdBy: { __typename: "User"; id: string; name: string; email: string } | null;
      reviewers: Array<{ __typename: "User"; id: string; name: string; email: string }>;
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
  };
};

export type GetModalRequestsQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  key?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  state?: Types.InputMaybe<Array<Types.RequestState> | Types.RequestState>;
  pagination?: Types.InputMaybe<Types.Pagination>;
  createdBy?: Types.InputMaybe<Types.Scalars["ID"]["input"]>;
  reviewer?: Types.InputMaybe<Types.Scalars["ID"]["input"]>;
  sort?: Types.InputMaybe<Types.Sort>;
}>;

export type GetModalRequestsQuery = {
  requests: {
    __typename: "RequestConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Request";
      id: string;
      title: string;
      description: string | null;
      state: Types.RequestState;
      createdAt: Date;
      createdBy: { __typename: "User"; name: string } | null;
      items: Array<{ __typename: "RequestItem"; itemId: string; version: string | null }>;
      reviewers: Array<{ __typename: "User"; id: string; name: string }>;
    } | null>;
  };
};

export type GetRequestQueryVariables = Types.Exact<{
  requestId: Types.Scalars["ID"]["input"];
}>;

export type GetRequestQuery = {
  node:
    | { __typename: "Asset"; id: string }
    | { __typename: "Group"; id: string }
    | { __typename: "Integration"; id: string }
    | { __typename: "Item"; id: string }
    | { __typename: "Model"; id: string }
    | { __typename: "Project"; id: string }
    | {
        __typename: "Request";
        id: string;
        title: string;
        description: string | null;
        workspaceId: string;
        projectId: string;
        threadId: string | null;
        reviewersId: Array<string>;
        state: Types.RequestState;
        createdAt: Date;
        updatedAt: Date;
        approvedAt: Date | null;
        closedAt: Date | null;
        items: Array<{
          __typename: "RequestItem";
          itemId: string;
          version: string | null;
          ref: string | null;
          item: {
            __typename: "VersionedItem";
            version: string;
            parents: Array<string> | null;
            refs: Array<string>;
            value: {
              __typename: "Item";
              id: string;
              title: string | null;
              schemaId: string;
              modelId: string;
              model: { __typename: "Model"; name: string };
              fields: Array<{
                __typename: "ItemField";
                schemaFieldId: string;
                type: Types.SchemaFieldType;
                value: unknown | null;
                itemGroupId: string | null;
              }>;
              referencedItems: Array<{
                __typename: "Item";
                id: string;
                title: string | null;
                schemaId: string;
                status: Types.ItemStatus;
                version: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy:
                  | { __typename: "Integration"; name: string }
                  | { __typename: "User"; name: string }
                  | null;
              }> | null;
              schema: {
                __typename: "Schema";
                id: string;
                fields: Array<{
                  __typename: "SchemaField";
                  id: string;
                  type: Types.SchemaFieldType;
                  title: string;
                  key: string;
                  description: string | null;
                  required: boolean;
                  unique: boolean;
                  isTitle: boolean;
                  multiple: boolean;
                  typeProperty:
                    | { __typename: "SchemaFieldAsset"; assetDefaultValue: unknown | null }
                    | { __typename: "SchemaFieldBool"; defaultValue: unknown | null }
                    | { __typename: "SchemaFieldCheckbox" }
                    | { __typename: "SchemaFieldDate" }
                    | { __typename: "SchemaFieldGeometryEditor" }
                    | { __typename: "SchemaFieldGeometryObject" }
                    | { __typename: "SchemaFieldGroup"; groupId: string }
                    | {
                        __typename: "SchemaFieldInteger";
                        min: number | null;
                        max: number | null;
                        integerDefaultValue: unknown | null;
                      }
                    | {
                        __typename: "SchemaFieldMarkdown";
                        defaultValue: unknown | null;
                        maxLength: number | null;
                      }
                    | { __typename: "SchemaFieldNumber" }
                    | { __typename: "SchemaFieldReference"; modelId: string }
                    | { __typename: "SchemaFieldRichText" }
                    | {
                        __typename: "SchemaFieldSelect";
                        values: Array<string>;
                        selectDefaultValue: unknown | null;
                      }
                    | { __typename: "SchemaFieldTag" }
                    | {
                        __typename: "SchemaFieldText";
                        defaultValue: unknown | null;
                        maxLength: number | null;
                      }
                    | {
                        __typename: "SchemaFieldTextArea";
                        defaultValue: unknown | null;
                        maxLength: number | null;
                      }
                    | { __typename: "SchemaFieldURL"; defaultValue: unknown | null }
                    | null;
                }>;
              };
            };
          } | null;
        }>;
        createdBy: { __typename: "User"; id: string; name: string; email: string } | null;
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
        project: {
          __typename: "Project";
          id: string;
          name: string;
          createdAt: Date;
          updatedAt: Date;
        } | null;
        reviewers: Array<{ __typename: "User"; id: string; name: string; email: string }>;
      }
    | { __typename: "Schema"; id: string }
    | { __typename: "User"; id: string }
    | { __typename: "View"; id: string }
    | { __typename: "Workspace"; id: string }
    | { __typename: "WorkspaceSettings"; id: string }
    | null;
};

export type CreateRequestMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  title: Types.Scalars["String"]["input"];
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  state?: Types.InputMaybe<Types.RequestState>;
  reviewersId?: Types.InputMaybe<
    Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"]
  >;
  items: Array<Types.RequestItemInput> | Types.RequestItemInput;
}>;

export type CreateRequestMutation = {
  createRequest: {
    __typename: "RequestPayload";
    request: {
      __typename: "Request";
      id: string;
      title: string;
      description: string | null;
      workspaceId: string;
      projectId: string;
      threadId: string | null;
      reviewersId: Array<string>;
      state: Types.RequestState;
      createdAt: Date;
      updatedAt: Date;
      approvedAt: Date | null;
      closedAt: Date | null;
      items: Array<{
        __typename: "RequestItem";
        itemId: string;
        version: string | null;
        ref: string | null;
        item: {
          __typename: "VersionedItem";
          version: string;
          parents: Array<string> | null;
          refs: Array<string>;
          value: {
            __typename: "Item";
            id: string;
            title: string | null;
            schemaId: string;
            modelId: string;
            model: { __typename: "Model"; name: string };
            fields: Array<{
              __typename: "ItemField";
              schemaFieldId: string;
              type: Types.SchemaFieldType;
              value: unknown | null;
              itemGroupId: string | null;
            }>;
            referencedItems: Array<{
              __typename: "Item";
              id: string;
              title: string | null;
              schemaId: string;
              status: Types.ItemStatus;
              version: string;
              createdAt: Date;
              updatedAt: Date;
              createdBy:
                | { __typename: "Integration"; name: string }
                | { __typename: "User"; name: string }
                | null;
            }> | null;
            schema: {
              __typename: "Schema";
              id: string;
              fields: Array<{
                __typename: "SchemaField";
                id: string;
                type: Types.SchemaFieldType;
                title: string;
                key: string;
                description: string | null;
                required: boolean;
                unique: boolean;
                isTitle: boolean;
                multiple: boolean;
                typeProperty:
                  | { __typename: "SchemaFieldAsset"; assetDefaultValue: unknown | null }
                  | { __typename: "SchemaFieldBool"; defaultValue: unknown | null }
                  | { __typename: "SchemaFieldCheckbox" }
                  | { __typename: "SchemaFieldDate" }
                  | { __typename: "SchemaFieldGeometryEditor" }
                  | { __typename: "SchemaFieldGeometryObject" }
                  | { __typename: "SchemaFieldGroup"; groupId: string }
                  | {
                      __typename: "SchemaFieldInteger";
                      min: number | null;
                      max: number | null;
                      integerDefaultValue: unknown | null;
                    }
                  | {
                      __typename: "SchemaFieldMarkdown";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | { __typename: "SchemaFieldNumber" }
                  | { __typename: "SchemaFieldReference"; modelId: string }
                  | { __typename: "SchemaFieldRichText" }
                  | {
                      __typename: "SchemaFieldSelect";
                      values: Array<string>;
                      selectDefaultValue: unknown | null;
                    }
                  | { __typename: "SchemaFieldTag" }
                  | {
                      __typename: "SchemaFieldText";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | {
                      __typename: "SchemaFieldTextArea";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | { __typename: "SchemaFieldURL"; defaultValue: unknown | null }
                  | null;
              }>;
            };
          };
        } | null;
      }>;
      createdBy: { __typename: "User"; id: string; name: string; email: string } | null;
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
      project: {
        __typename: "Project";
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      } | null;
      reviewers: Array<{ __typename: "User"; id: string; name: string; email: string }>;
    };
  } | null;
};

export type UpdateRequestMutationVariables = Types.Exact<{
  requestId: Types.Scalars["ID"]["input"];
  title?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  state?: Types.InputMaybe<Types.RequestState>;
  reviewersId?: Types.InputMaybe<
    Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"]
  >;
  items?: Types.InputMaybe<Array<Types.RequestItemInput> | Types.RequestItemInput>;
}>;

export type UpdateRequestMutation = {
  updateRequest: {
    __typename: "RequestPayload";
    request: {
      __typename: "Request";
      id: string;
      title: string;
      description: string | null;
      workspaceId: string;
      projectId: string;
      threadId: string | null;
      reviewersId: Array<string>;
      state: Types.RequestState;
      createdAt: Date;
      updatedAt: Date;
      approvedAt: Date | null;
      closedAt: Date | null;
      items: Array<{
        __typename: "RequestItem";
        itemId: string;
        version: string | null;
        ref: string | null;
        item: {
          __typename: "VersionedItem";
          version: string;
          parents: Array<string> | null;
          refs: Array<string>;
          value: {
            __typename: "Item";
            id: string;
            title: string | null;
            schemaId: string;
            modelId: string;
            model: { __typename: "Model"; name: string };
            fields: Array<{
              __typename: "ItemField";
              schemaFieldId: string;
              type: Types.SchemaFieldType;
              value: unknown | null;
              itemGroupId: string | null;
            }>;
            referencedItems: Array<{
              __typename: "Item";
              id: string;
              title: string | null;
              schemaId: string;
              status: Types.ItemStatus;
              version: string;
              createdAt: Date;
              updatedAt: Date;
              createdBy:
                | { __typename: "Integration"; name: string }
                | { __typename: "User"; name: string }
                | null;
            }> | null;
            schema: {
              __typename: "Schema";
              id: string;
              fields: Array<{
                __typename: "SchemaField";
                id: string;
                type: Types.SchemaFieldType;
                title: string;
                key: string;
                description: string | null;
                required: boolean;
                unique: boolean;
                isTitle: boolean;
                multiple: boolean;
                typeProperty:
                  | { __typename: "SchemaFieldAsset"; assetDefaultValue: unknown | null }
                  | { __typename: "SchemaFieldBool"; defaultValue: unknown | null }
                  | { __typename: "SchemaFieldCheckbox" }
                  | { __typename: "SchemaFieldDate" }
                  | { __typename: "SchemaFieldGeometryEditor" }
                  | { __typename: "SchemaFieldGeometryObject" }
                  | { __typename: "SchemaFieldGroup"; groupId: string }
                  | {
                      __typename: "SchemaFieldInteger";
                      min: number | null;
                      max: number | null;
                      integerDefaultValue: unknown | null;
                    }
                  | {
                      __typename: "SchemaFieldMarkdown";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | { __typename: "SchemaFieldNumber" }
                  | { __typename: "SchemaFieldReference"; modelId: string }
                  | { __typename: "SchemaFieldRichText" }
                  | {
                      __typename: "SchemaFieldSelect";
                      values: Array<string>;
                      selectDefaultValue: unknown | null;
                    }
                  | { __typename: "SchemaFieldTag" }
                  | {
                      __typename: "SchemaFieldText";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | {
                      __typename: "SchemaFieldTextArea";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | { __typename: "SchemaFieldURL"; defaultValue: unknown | null }
                  | null;
              }>;
            };
          };
        } | null;
      }>;
      createdBy: { __typename: "User"; id: string; name: string; email: string } | null;
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
      project: {
        __typename: "Project";
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      } | null;
      reviewers: Array<{ __typename: "User"; id: string; name: string; email: string }>;
    };
  } | null;
};

export type ApproveRequestMutationVariables = Types.Exact<{
  requestId: Types.Scalars["ID"]["input"];
}>;

export type ApproveRequestMutation = {
  approveRequest: {
    __typename: "RequestPayload";
    request: {
      __typename: "Request";
      id: string;
      title: string;
      description: string | null;
      workspaceId: string;
      projectId: string;
      threadId: string | null;
      reviewersId: Array<string>;
      state: Types.RequestState;
      createdAt: Date;
      updatedAt: Date;
      approvedAt: Date | null;
      closedAt: Date | null;
      items: Array<{
        __typename: "RequestItem";
        itemId: string;
        version: string | null;
        ref: string | null;
        item: {
          __typename: "VersionedItem";
          version: string;
          parents: Array<string> | null;
          refs: Array<string>;
          value: {
            __typename: "Item";
            id: string;
            title: string | null;
            schemaId: string;
            modelId: string;
            model: { __typename: "Model"; name: string };
            fields: Array<{
              __typename: "ItemField";
              schemaFieldId: string;
              type: Types.SchemaFieldType;
              value: unknown | null;
              itemGroupId: string | null;
            }>;
            referencedItems: Array<{
              __typename: "Item";
              id: string;
              title: string | null;
              schemaId: string;
              status: Types.ItemStatus;
              version: string;
              createdAt: Date;
              updatedAt: Date;
              createdBy:
                | { __typename: "Integration"; name: string }
                | { __typename: "User"; name: string }
                | null;
            }> | null;
            schema: {
              __typename: "Schema";
              id: string;
              fields: Array<{
                __typename: "SchemaField";
                id: string;
                type: Types.SchemaFieldType;
                title: string;
                key: string;
                description: string | null;
                required: boolean;
                unique: boolean;
                isTitle: boolean;
                multiple: boolean;
                typeProperty:
                  | { __typename: "SchemaFieldAsset"; assetDefaultValue: unknown | null }
                  | { __typename: "SchemaFieldBool"; defaultValue: unknown | null }
                  | { __typename: "SchemaFieldCheckbox" }
                  | { __typename: "SchemaFieldDate" }
                  | { __typename: "SchemaFieldGeometryEditor" }
                  | { __typename: "SchemaFieldGeometryObject" }
                  | { __typename: "SchemaFieldGroup"; groupId: string }
                  | {
                      __typename: "SchemaFieldInteger";
                      min: number | null;
                      max: number | null;
                      integerDefaultValue: unknown | null;
                    }
                  | {
                      __typename: "SchemaFieldMarkdown";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | { __typename: "SchemaFieldNumber" }
                  | { __typename: "SchemaFieldReference"; modelId: string }
                  | { __typename: "SchemaFieldRichText" }
                  | {
                      __typename: "SchemaFieldSelect";
                      values: Array<string>;
                      selectDefaultValue: unknown | null;
                    }
                  | { __typename: "SchemaFieldTag" }
                  | {
                      __typename: "SchemaFieldText";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | {
                      __typename: "SchemaFieldTextArea";
                      defaultValue: unknown | null;
                      maxLength: number | null;
                    }
                  | { __typename: "SchemaFieldURL"; defaultValue: unknown | null }
                  | null;
              }>;
            };
          };
        } | null;
      }>;
      createdBy: { __typename: "User"; id: string; name: string; email: string } | null;
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
      project: {
        __typename: "Project";
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      } | null;
      reviewers: Array<{ __typename: "User"; id: string; name: string; email: string }>;
    };
  } | null;
};

export type DeleteRequestMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  requestsId: Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"];
}>;

export type DeleteRequestMutation = {
  deleteRequest: { __typename: "DeleteRequestPayload"; requests: Array<string> } | null;
};

export const GetRequestsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRequests" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "state" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "RequestState" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Pagination" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "createdBy" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Sort" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requests" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "key" },
                value: { kind: "Variable", name: { kind: "Name", value: "key" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "state" },
                value: { kind: "Variable", name: { kind: "Name", value: "state" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pagination" },
                value: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "createdBy" },
                value: { kind: "Variable", name: { kind: "Name", value: "createdBy" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewer" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sort" },
                value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
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
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
                      { kind: "Field", name: { kind: "Name", value: "projectId" } },
                      { kind: "Field", name: { kind: "Name", value: "threadId" } },
                      { kind: "Field", name: { kind: "Name", value: "reviewersId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reviewers" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                            { kind: "Field", name: { kind: "Name", value: "email" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "state" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "closedAt" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "thread" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "threadFragment" },
                            },
                          ],
                        },
                      },
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
  ],
} as unknown as DocumentNode<GetRequestsQuery, GetRequestsQueryVariables>;
export const GetModalRequestsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetModalRequests" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "state" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "RequestState" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Pagination" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "createdBy" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Sort" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "requests" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "key" },
                value: { kind: "Variable", name: { kind: "Name", value: "key" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "state" },
                value: { kind: "Variable", name: { kind: "Name", value: "state" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pagination" },
                value: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "createdBy" },
                value: { kind: "Variable", name: { kind: "Name", value: "createdBy" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "reviewer" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sort" },
                value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
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
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "name" } }],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "items" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "itemId" } },
                            { kind: "Field", name: { kind: "Name", value: "version" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reviewers" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "name" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "state" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
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
} as unknown as DocumentNode<GetModalRequestsQuery, GetModalRequestsQueryVariables>;
export const GetRequestDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRequest" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "REQUEST" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Request" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "requestFragment" } },
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
      name: { kind: "Name", value: "requestFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Request" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "itemId" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "ref" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "parents" } },
                      { kind: "Field", name: { kind: "Name", value: "refs" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "value" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                            { kind: "Field", name: { kind: "Name", value: "modelId" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "model" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                  { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "referencedItems" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "title" } },
                                  { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "createdBy" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
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
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "User" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "status" } },
                                  { kind: "Field", name: { kind: "Name", value: "version" } },
                                  { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                                  { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "schema" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fields" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        { kind: "Field", name: { kind: "Name", value: "title" } },
                                        { kind: "Field", name: { kind: "Name", value: "key" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "description" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "required" },
                                        },
                                        { kind: "Field", name: { kind: "Name", value: "unique" } },
                                        { kind: "Field", name: { kind: "Name", value: "isTitle" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "multiple" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "typeProperty" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldText" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldTextArea",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldMarkdown",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldAsset" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "assetDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldSelect",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "selectDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "values" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldInteger",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "integerDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "min" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "max" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldBool" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldURL" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldReference",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "modelId" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldGroup" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "groupId" },
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
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "threadId" } },
          { kind: "Field", name: { kind: "Name", value: "reviewersId" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
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
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "reviewers" },
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
} as unknown as DocumentNode<GetRequestQuery, GetRequestQueryVariables>;
export const CreateRequestDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateRequest" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "state" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "RequestState" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewersId" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "items" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "RequestItemInput" } },
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
            name: { kind: "Name", value: "createRequest" },
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
                      name: { kind: "Name", value: "title" },
                      value: { kind: "Variable", name: { kind: "Name", value: "title" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "state" },
                      value: { kind: "Variable", name: { kind: "Name", value: "state" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "reviewersId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "reviewersId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "items" },
                      value: { kind: "Variable", name: { kind: "Name", value: "items" } },
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
                  name: { kind: "Name", value: "request" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "requestFragment" } },
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
      name: { kind: "Name", value: "requestFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Request" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "itemId" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "ref" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "parents" } },
                      { kind: "Field", name: { kind: "Name", value: "refs" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "value" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                            { kind: "Field", name: { kind: "Name", value: "modelId" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "model" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                  { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "referencedItems" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "title" } },
                                  { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "createdBy" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
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
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "User" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "status" } },
                                  { kind: "Field", name: { kind: "Name", value: "version" } },
                                  { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                                  { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "schema" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fields" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        { kind: "Field", name: { kind: "Name", value: "title" } },
                                        { kind: "Field", name: { kind: "Name", value: "key" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "description" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "required" },
                                        },
                                        { kind: "Field", name: { kind: "Name", value: "unique" } },
                                        { kind: "Field", name: { kind: "Name", value: "isTitle" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "multiple" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "typeProperty" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldText" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldTextArea",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldMarkdown",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldAsset" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "assetDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldSelect",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "selectDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "values" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldInteger",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "integerDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "min" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "max" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldBool" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldURL" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldReference",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "modelId" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldGroup" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "groupId" },
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
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "threadId" } },
          { kind: "Field", name: { kind: "Name", value: "reviewersId" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
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
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "reviewers" },
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
} as unknown as DocumentNode<CreateRequestMutation, CreateRequestMutationVariables>;
export const UpdateRequestDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateRequest" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "title" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "state" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "RequestState" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewersId" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "items" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "RequestItemInput" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateRequest" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "requestId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "title" },
                      value: { kind: "Variable", name: { kind: "Name", value: "title" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "state" },
                      value: { kind: "Variable", name: { kind: "Name", value: "state" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "reviewersId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "reviewersId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "items" },
                      value: { kind: "Variable", name: { kind: "Name", value: "items" } },
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
                  name: { kind: "Name", value: "request" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "requestFragment" } },
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
      name: { kind: "Name", value: "requestFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Request" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "itemId" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "ref" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "parents" } },
                      { kind: "Field", name: { kind: "Name", value: "refs" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "value" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                            { kind: "Field", name: { kind: "Name", value: "modelId" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "model" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                  { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "referencedItems" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "title" } },
                                  { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "createdBy" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
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
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "User" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "status" } },
                                  { kind: "Field", name: { kind: "Name", value: "version" } },
                                  { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                                  { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "schema" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fields" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        { kind: "Field", name: { kind: "Name", value: "title" } },
                                        { kind: "Field", name: { kind: "Name", value: "key" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "description" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "required" },
                                        },
                                        { kind: "Field", name: { kind: "Name", value: "unique" } },
                                        { kind: "Field", name: { kind: "Name", value: "isTitle" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "multiple" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "typeProperty" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldText" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldTextArea",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldMarkdown",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldAsset" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "assetDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldSelect",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "selectDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "values" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldInteger",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "integerDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "min" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "max" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldBool" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldURL" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldReference",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "modelId" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldGroup" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "groupId" },
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
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "threadId" } },
          { kind: "Field", name: { kind: "Name", value: "reviewersId" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
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
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "reviewers" },
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
} as unknown as DocumentNode<UpdateRequestMutation, UpdateRequestMutationVariables>;
export const ApproveRequestDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ApproveRequest" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
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
            name: { kind: "Name", value: "approveRequest" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "requestId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "requestId" } },
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
                  name: { kind: "Name", value: "request" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "FragmentSpread", name: { kind: "Name", value: "requestFragment" } },
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
      name: { kind: "Name", value: "requestFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Request" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "itemId" } },
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "ref" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "parents" } },
                      { kind: "Field", name: { kind: "Name", value: "refs" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "value" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                            { kind: "Field", name: { kind: "Name", value: "modelId" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "model" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                  { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "referencedItems" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "title" } },
                                  { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "createdBy" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
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
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "User" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "name" },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "status" } },
                                  { kind: "Field", name: { kind: "Name", value: "version" } },
                                  { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                                  { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "schema" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fields" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        { kind: "Field", name: { kind: "Name", value: "id" } },
                                        { kind: "Field", name: { kind: "Name", value: "type" } },
                                        { kind: "Field", name: { kind: "Name", value: "title" } },
                                        { kind: "Field", name: { kind: "Name", value: "key" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "description" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "required" },
                                        },
                                        { kind: "Field", name: { kind: "Name", value: "unique" } },
                                        { kind: "Field", name: { kind: "Name", value: "isTitle" } },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "multiple" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "typeProperty" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldText" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldTextArea",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldMarkdown",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "maxLength" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldAsset" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "assetDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldSelect",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "selectDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "values" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldInteger",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      alias: {
                                                        kind: "Name",
                                                        value: "integerDefaultValue",
                                                      },
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "min" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "max" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldBool" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldURL" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "defaultValue" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: {
                                                    kind: "Name",
                                                    value: "SchemaFieldReference",
                                                  },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "modelId" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "InlineFragment",
                                                typeCondition: {
                                                  kind: "NamedType",
                                                  name: { kind: "Name", value: "SchemaFieldGroup" },
                                                },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "groupId" },
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
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "workspaceId" } },
          { kind: "Field", name: { kind: "Name", value: "projectId" } },
          { kind: "Field", name: { kind: "Name", value: "threadId" } },
          { kind: "Field", name: { kind: "Name", value: "reviewersId" } },
          { kind: "Field", name: { kind: "Name", value: "state" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "approvedAt" } },
          { kind: "Field", name: { kind: "Name", value: "closedAt" } },
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
          {
            kind: "Field",
            name: { kind: "Name", value: "project" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "reviewers" },
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
} as unknown as DocumentNode<ApproveRequestMutation, ApproveRequestMutationVariables>;
export const DeleteRequestDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteRequest" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "requestsId" } },
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
            name: { kind: "Name", value: "deleteRequest" },
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
                      name: { kind: "Name", value: "requestsId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "requestsId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "requests" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteRequestMutation, DeleteRequestMutationVariables>;
