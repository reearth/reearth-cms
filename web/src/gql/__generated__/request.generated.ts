import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type RequestFragmentFragment = {
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

export const RequestFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
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
} as unknown as DocumentNode<RequestFragmentFragment, unknown>;
