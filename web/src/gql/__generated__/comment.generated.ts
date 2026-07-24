/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type OperatorType = "Integration" | "User";

export type AddCommentMutationVariables = Exact<{
  threadId: string;
  content: string;
}>;

export type AddCommentMutation = {
  addComment: {
    __typename: "CommentPayload";
    comment: {
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
    };
  } | null;
};

export type UpdateCommentMutationVariables = Exact<{
  commentId: string;
  threadId: string;
  content: string;
}>;

export type UpdateCommentMutation = {
  updateComment: {
    __typename: "CommentPayload";
    comment: {
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
    };
  } | null;
};

export type DeleteCommentMutationVariables = Exact<{
  commentId: string;
  threadId: string;
}>;

export type DeleteCommentMutation = {
  deleteComment: { __typename: "DeleteCommentPayload"; commentId: string } | null;
};

export const AddCommentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddComment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
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
            name: { kind: "Name", value: "addComment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "threadId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
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
                  name: { kind: "Name", value: "comment" },
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
} as unknown as DocumentNode<AddCommentMutation, AddCommentMutationVariables>;
export const UpdateCommentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateComment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "commentId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
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
            name: { kind: "Name", value: "updateComment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "commentId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "commentId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "threadId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
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
                  name: { kind: "Name", value: "comment" },
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
} as unknown as DocumentNode<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const DeleteCommentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteComment" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "commentId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
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
            name: { kind: "Name", value: "deleteComment" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "commentId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "commentId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "threadId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "threadId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "commentId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteCommentMutation, DeleteCommentMutationVariables>;
