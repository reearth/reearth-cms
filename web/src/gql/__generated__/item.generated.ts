/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type AndConditionInput = {
  conditions: Array<ConditionInput>;
};

export type BasicFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: BasicOperator;
  value: unknown;
};

export type BasicOperator = "EQUALS" | "NOT_EQUALS";

export type BoolFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: BoolOperator;
  value: boolean;
};

export type BoolOperator = "EQUALS" | "NOT_EQUALS";

export type ConditionInput = {
  and?: AndConditionInput | null | undefined;
  basic?: BasicFieldConditionInput | null | undefined;
  bool?: BoolFieldConditionInput | null | undefined;
  multiple?: MultipleFieldConditionInput | null | undefined;
  nullable?: NullableFieldConditionInput | null | undefined;
  number?: NumberFieldConditionInput | null | undefined;
  or?: OrConditionInput | null | undefined;
  string?: StringFieldConditionInput | null | undefined;
  time?: TimeFieldConditionInput | null | undefined;
};

export type FieldSelectorInput = {
  id?: string | null | undefined;
  type: FieldType;
};

export type FieldType =
  | "CREATION_DATE"
  | "CREATION_USER"
  | "FIELD"
  | "ID"
  | "META_FIELD"
  | "MODIFICATION_DATE"
  | "MODIFICATION_USER"
  | "STATUS";

export type ImportItemsInput = {
  file: unknown;
  geoField?: string | null | undefined;
  modelId: string;
};

export type ItemFieldInput = {
  itemGroupId?: string | null | undefined;
  schemaFieldId: string;
  type: SchemaFieldType;
  value: unknown;
};

export type ItemQueryInput = {
  model: string;
  project: string;
  q?: string | null | undefined;
  schema?: string | null | undefined;
};

export type ItemSortInput = {
  direction?: SortDirection | null | undefined;
  field: FieldSelectorInput;
};

export type ItemStatus = "DRAFT" | "PUBLIC" | "PUBLIC_DRAFT" | "PUBLIC_REVIEW" | "REVIEW";

export type JobStatus = "CANCELLED" | "COMPLETED" | "FAILED" | "IN_PROGRESS" | "PENDING";

export type JobType = "IMPORT";

export type MultipleFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: MultipleOperator;
  value: Array<unknown>;
};

export type MultipleOperator =
  | "INCLUDES_ALL"
  | "INCLUDES_ANY"
  | "NOT_INCLUDES_ALL"
  | "NOT_INCLUDES_ANY";

export type NullableFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: NullableOperator;
};

export type NullableOperator = "EMPTY" | "NOT_EMPTY";

export type NumberFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: NumberOperator;
  value: number;
};

export type NumberOperator =
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL_TO"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL_TO";

export type OrConditionInput = {
  conditions: Array<ConditionInput>;
};

export type Pagination = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  offset?: number | null | undefined;
};

export type RequestState = "APPROVED" | "CLOSED" | "DRAFT" | "WAITING";

export type SchemaFieldType =
  | "Asset"
  | "Bool"
  | "Checkbox"
  | "Date"
  | "GeometryEditor"
  | "GeometryObject"
  | "Group"
  | "Integer"
  | "MarkdownText"
  | "Number"
  | "Reference"
  | "RichText"
  | "Select"
  | "Tag"
  | "Text"
  | "TextArea"
  | "URL";

export type SearchItemInput = {
  filter?: ConditionInput | null | undefined;
  pagination?: Pagination | null | undefined;
  query: ItemQueryInput;
  sort?: ItemSortInput | null | undefined;
};

export type SortDirection = "ASC" | "DESC";

export type StringFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: StringOperator;
  value: string;
};

export type StringOperator =
  | "CONTAINS"
  | "ENDS_WITH"
  | "NOT_CONTAINS"
  | "NOT_ENDS_WITH"
  | "NOT_STARTS_WITH"
  | "STARTS_WITH";

export type TimeFieldConditionInput = {
  fieldId: FieldSelectorInput;
  operator: TimeOperator;
  value: Date;
};

export type TimeOperator =
  | "AFTER"
  | "AFTER_OR_ON"
  | "BEFORE"
  | "BEFORE_OR_ON"
  | "OF_THIS_MONTH"
  | "OF_THIS_WEEK"
  | "OF_THIS_YEAR";

export type GetItemsQueryVariables = Exact<{
  query: Types.ItemQueryInput;
  pagination?: Types.Pagination | null | undefined;
}>;

export type GetItemsQuery = {
  searchItem: {
    __typename: "ItemConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Item";
      id: string;
      title: string | null;
      schemaId: string;
      createdAt: Date;
      updatedAt: Date;
      status: Types.ItemStatus;
      version: string;
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
      createdBy:
        | { __typename: "Integration"; name: string }
        | { __typename: "User"; name: string }
        | null;
      fields: Array<{
        __typename: "ItemField";
        schemaFieldId: string;
        itemGroupId: string | null;
        type: Types.SchemaFieldType;
        value: unknown;
      }>;
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
      metadata: {
        __typename: "Item";
        id: string;
        version: string;
        fields: Array<{
          __typename: "ItemField";
          schemaFieldId: string;
          itemGroupId: string | null;
          type: Types.SchemaFieldType;
          value: unknown;
        }>;
      } | null;
    } | null>;
  };
};

export type GetItemQueryVariables = Exact<{
  id: string;
}>;

export type GetItemQuery = {
  node:
    | { __typename: "Asset" }
    | { __typename: "Group" }
    | { __typename: "Integration" }
    | {
        __typename: "Item";
        id: string;
        title: string | null;
        schemaId: string;
        createdAt: Date;
        updatedAt: Date;
        status: Types.ItemStatus;
        version: string;
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
        assets: Array<{ __typename: "Asset"; id: string; url: string; fileName: string } | null>;
        createdBy:
          | { __typename: "Integration"; id: string; name: string }
          | { __typename: "User"; id: string; name: string }
          | null;
        updatedBy:
          | { __typename: "Integration"; name: string }
          | { __typename: "User"; name: string }
          | null;
        fields: Array<{
          __typename: "ItemField";
          schemaFieldId: string;
          itemGroupId: string | null;
          type: Types.SchemaFieldType;
          value: unknown;
        }>;
        metadata: {
          __typename: "Item";
          id: string;
          version: string;
          fields: Array<{
            __typename: "ItemField";
            schemaFieldId: string;
            type: Types.SchemaFieldType;
            value: unknown;
          }>;
        } | null;
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
        requests: Array<{
          __typename: "Request";
          id: string;
          state: Types.RequestState;
          title: string;
        }> | null;
      }
    | { __typename: "Job" }
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

export type IsItemReferencedQueryVariables = Exact<{
  itemId: string;
  correspondingFieldId: string;
}>;

export type IsItemReferencedQuery = { isItemReferenced: boolean };

export type VersionsByItemQueryVariables = Exact<{
  itemId: string;
}>;

export type VersionsByItemQuery = {
  versionsByItem: Array<{
    __typename: "VersionedItem";
    version: string;
    refs: Array<string>;
    value: {
      __typename: "Item";
      id: string;
      version: string;
      modelId: string;
      status: Types.ItemStatus;
      createdAt: Date;
      updatedAt: Date;
      createdBy:
        | { __typename: "Integration"; name: string }
        | { __typename: "User"; name: string }
        | null;
      updatedBy:
        | { __typename: "Integration"; name: string }
        | { __typename: "User"; name: string }
        | null;
      fields: Array<{
        __typename: "ItemField";
        schemaFieldId: string;
        itemGroupId: string | null;
        type: Types.SchemaFieldType;
        value: unknown;
      }>;
      requests: Array<{
        __typename: "Request";
        id: string;
        title: string;
        state: Types.RequestState;
        items: Array<{
          __typename: "RequestItem";
          itemId: string;
          version: string | null;
          item: {
            __typename: "VersionedItem";
            value: { __typename: "Item"; modelId: string };
          } | null;
        }>;
      }> | null;
    };
  }>;
};

export type SearchItemQueryVariables = Exact<{
  searchItemInput: Types.SearchItemInput;
}>;

export type SearchItemQuery = {
  searchItem: {
    __typename: "ItemConnection";
    totalCount: number;
    nodes: Array<{
      __typename: "Item";
      id: string;
      title: string | null;
      schemaId: string;
      createdAt: Date;
      updatedAt: Date;
      status: Types.ItemStatus;
      version: string;
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
      assets: Array<{ __typename: "Asset"; id: string; url: string } | null>;
      fields: Array<{
        __typename: "ItemField";
        schemaFieldId: string;
        itemGroupId: string | null;
        type: Types.SchemaFieldType;
        value: unknown;
      }>;
      createdBy:
        | { __typename: "Integration"; id: string; name: string }
        | { __typename: "User"; id: string; name: string }
        | null;
      updatedBy:
        | { __typename: "Integration"; name: string }
        | { __typename: "User"; name: string }
        | null;
      metadata: {
        __typename: "Item";
        id: string;
        version: string;
        fields: Array<{
          __typename: "ItemField";
          schemaFieldId: string;
          type: Types.SchemaFieldType;
          value: unknown;
        }>;
      } | null;
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
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
};

export type CreateItemMutationVariables = Exact<{
  modelId: string;
  schemaId: string;
  metadataId?: string | null | undefined;
  fields: Array<Types.ItemFieldInput> | Types.ItemFieldInput;
}>;

export type CreateItemMutation = {
  createItem: {
    __typename: "ItemPayload";
    item: {
      __typename: "Item";
      id: string;
      schemaId: string;
      version: string;
      fields: Array<{
        __typename: "ItemField";
        value: unknown;
        type: Types.SchemaFieldType;
        schemaFieldId: string;
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
    };
  } | null;
};

export type DeleteItemMutationVariables = Exact<{
  itemId: string;
}>;

export type DeleteItemMutation = {
  deleteItem: { __typename: "DeleteItemPayload"; itemId: string } | null;
};

export type DeleteItemsMutationVariables = Exact<{
  itemIds: Array<string> | string;
}>;

export type DeleteItemsMutation = {
  deleteItems: { __typename: "DeleteItemsPayload"; itemIds: Array<string> } | null;
};

export type UpdateItemMutationVariables = Exact<{
  itemId: string;
  fields: Array<Types.ItemFieldInput> | Types.ItemFieldInput;
  metadataId?: string | null | undefined;
  version: string;
}>;

export type UpdateItemMutation = {
  updateItem: {
    __typename: "ItemPayload";
    item: {
      __typename: "Item";
      id: string;
      schemaId: string;
      version: string;
      fields: Array<{
        __typename: "ItemField";
        value: unknown;
        type: Types.SchemaFieldType;
        schemaFieldId: string;
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
    };
  } | null;
};

export type UnpublishItemMutationVariables = Exact<{
  itemIds: Array<string> | string;
}>;

export type UnpublishItemMutation = {
  unpublishItem: {
    __typename: "UnpublishItemPayload";
    items: Array<{
      __typename: "Item";
      id: string;
      version: string;
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
    }>;
  } | null;
};

export type PublishItemMutationVariables = Exact<{
  itemIds: Array<string> | string;
}>;

export type PublishItemMutation = {
  publishItem: {
    __typename: "PublishItemPayload";
    items: Array<{
      __typename: "Item";
      id: string;
      version: string;
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
    }>;
  } | null;
};

export type ImportItemsMutationVariables = Exact<{
  input: Types.ImportItemsInput;
}>;

export type ImportItemsMutation = {
  importItems: {
    __typename: "ImportItemsPayload";
    modelId: string;
    totalCount: number;
    insertedCount: number;
    updatedCount: number;
    ignoredCount: number;
  } | null;
};

export type ImportItemsAsyncMutationVariables = Exact<{
  input: Types.ImportItemsInput;
}>;

export type ImportItemsAsyncMutation = {
  importItemsAsync: {
    __typename: "ImportItemsAsyncPayload";
    job: {
      __typename: "Job";
      id: string;
      type: Types.JobType;
      status: Types.JobStatus;
      projectId: string;
      progress: { __typename: "JobProgress"; processed: number; total: number; percentage: number };
    };
  } | null;
};

export const GetItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetItems" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "query" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ItemQueryInput" } },
          },
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
            name: { kind: "Name", value: "searchItem" },
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
                      value: { kind: "Variable", name: { kind: "Name", value: "query" } },
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
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
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
                            { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                          ],
                        },
                      },
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
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metadata" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "version" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                ],
                              },
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
} as unknown as DocumentNode<GetItemsQuery, GetItemsQueryVariables>;
export const GetItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetItem" },
      variableDefinitions: [
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
            name: { kind: "Name", value: "node" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "type" },
                value: { kind: "EnumValue", value: "Item" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Item" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "assets" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
                            { kind: "Field", name: { kind: "Name", value: "fileName" } },
                          ],
                        },
                      },
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
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedBy" },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
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
                            { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metadata" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "version" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
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
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requests" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "state" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
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
} as unknown as DocumentNode<GetItemQuery, GetItemQueryVariables>;
export const IsItemReferencedDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "IsItemReferenced" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "correspondingFieldId" } },
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
            name: { kind: "Name", value: "isItemReferenced" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "itemId" },
                value: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "correspondingFieldId" },
                value: { kind: "Variable", name: { kind: "Name", value: "correspondingFieldId" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<IsItemReferencedQuery, IsItemReferencedQueryVariables>;
export const VersionsByItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "VersionsByItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
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
            name: { kind: "Name", value: "versionsByItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "itemId" },
                value: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "version" } },
                { kind: "Field", name: { kind: "Name", value: "refs" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "value" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      { kind: "Field", name: { kind: "Name", value: "modelId" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedBy" },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
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
                            { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "requests" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "title" } },
                            { kind: "Field", name: { kind: "Name", value: "state" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "items" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "itemId" } },
                                  { kind: "Field", name: { kind: "Name", value: "version" } },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "item" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "value" },
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
} as unknown as DocumentNode<VersionsByItemQuery, VersionsByItemQueryVariables>;
export const SearchItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SearchItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "searchItemInput" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "SearchItemInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "searchItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "searchItemInput" } },
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
                      { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "assets" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "url" } },
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
                            { kind: "Field", name: { kind: "Name", value: "itemGroupId" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                          ],
                        },
                      },
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
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updatedBy" },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
                                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metadata" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "version" } },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fields" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "value" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
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
                {
                  kind: "Field",
                  name: { kind: "Name", value: "pageInfo" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "hasNextPage" } },
                      { kind: "Field", name: { kind: "Name", value: "hasPreviousPage" } },
                      { kind: "Field", name: { kind: "Name", value: "startCursor" } },
                      { kind: "Field", name: { kind: "Name", value: "endCursor" } },
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
  ],
} as unknown as DocumentNode<SearchItemQuery, SearchItemQueryVariables>;
export const CreateItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "schemaId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "metadataId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fields" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ItemFieldInput" } },
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
            name: { kind: "Name", value: "createItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "modelId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "schemaId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "schemaId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "metadataId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "metadataId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "fields" },
                      value: { kind: "Variable", name: { kind: "Name", value: "fields" } },
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
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fields" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<CreateItemMutation, CreateItemMutationVariables>;
export const DeleteItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
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
            name: { kind: "Name", value: "deleteItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "itemId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "itemId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteItemMutation, DeleteItemMutationVariables>;
export const DeleteItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteItems" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemIds" } },
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
            name: { kind: "Name", value: "deleteItems" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "itemIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "itemIds" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "itemIds" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteItemsMutation, DeleteItemsMutationVariables>;
export const UpdateItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fields" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ItemFieldInput" } },
              },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "metadataId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "version" } },
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
            name: { kind: "Name", value: "updateItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "itemId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "itemId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "fields" },
                      value: { kind: "Variable", name: { kind: "Name", value: "fields" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "metadataId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "metadataId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "version" },
                      value: { kind: "Variable", name: { kind: "Name", value: "version" } },
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
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fields" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "value" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "schemaFieldId" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<UpdateItemMutation, UpdateItemMutationVariables>;
export const UnpublishItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UnpublishItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemIds" } },
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
            name: { kind: "Name", value: "unpublishItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "itemIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "itemIds" } },
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
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<UnpublishItemMutation, UnpublishItemMutationVariables>;
export const PublishItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "PublishItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "itemIds" } },
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
            name: { kind: "Name", value: "publishItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "itemIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "itemIds" } },
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
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "version" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
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
} as unknown as DocumentNode<PublishItemMutation, PublishItemMutationVariables>;
export const ImportItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ImportItems" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ImportItemsInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "importItems" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "modelId" } },
                { kind: "Field", name: { kind: "Name", value: "totalCount" } },
                { kind: "Field", name: { kind: "Name", value: "insertedCount" } },
                { kind: "Field", name: { kind: "Name", value: "updatedCount" } },
                { kind: "Field", name: { kind: "Name", value: "ignoredCount" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ImportItemsMutation, ImportItemsMutationVariables>;
export const ImportItemsAsyncDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ImportItemsAsync" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ImportItemsInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "importItemsAsync" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "job" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "type" } },
                      { kind: "Field", name: { kind: "Name", value: "status" } },
                      { kind: "Field", name: { kind: "Name", value: "projectId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "progress" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "processed" } },
                            { kind: "Field", name: { kind: "Name", value: "total" } },
                            { kind: "Field", name: { kind: "Name", value: "percentage" } },
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
} as unknown as DocumentNode<ImportItemsAsyncMutation, ImportItemsAsyncMutationVariables>;
