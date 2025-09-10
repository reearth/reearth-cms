import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type ThreadFragmentFragment = {
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
};

export type CreateThreadWithCommentMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars["ID"]["input"];
  resourceId: Types.Scalars["ID"]["input"];
  resourceType: Types.ResourceType;
  content: Types.Scalars["String"]["input"];
}>;

export type CreateThreadWithCommentMutation = {
  createThreadWithComment: {
    __typename: "CommentPayload";
    thread: {
      __typename: "Thread";
      id: string;
      workspaceId: string;
      comments: Array<{
        __typename: "Comment";
        id: string;
        authorType: Types.OperatorType;
        authorId: string;
        content: string;
        createdAt: Date;
        author:
          | { __typename: "Integration"; id: string; name: string }
          | { __typename: "User"; id: string; name: string; email: string }
          | null;
      }>;
    };
  } | null;
};

export const ThreadFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
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
} as unknown as DocumentNode<ThreadFragmentFragment, unknown>;
export const CreateThreadWithCommentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateThreadWithComment" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "resourceId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "resourceType" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ResourceType" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "content" } },
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
            name: { kind: "Name", value: "createThreadWithComment" },
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
                      name: { kind: "Name", value: "resourceId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "resourceId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "resourceType" },
                      value: { kind: "Variable", name: { kind: "Name", value: "resourceType" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "content" },
                      value: { kind: "Variable", name: { kind: "Name", value: "content" } },
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
                  name: { kind: "Name", value: "thread" },
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
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "User" },
                                    },
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
                            { kind: "Field", name: { kind: "Name", value: "authorType" } },
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
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateThreadWithCommentMutation,
  CreateThreadWithCommentMutationVariables
>;
