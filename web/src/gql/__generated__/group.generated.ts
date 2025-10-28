import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetGroupsQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
}>;

export type GetGroupsQuery = {
  groups: Array<{
    __typename: "Group";
    id: string;
    name: string;
    key: string;
    order: number;
  } | null>;
};

export type GetGroupQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type GetGroupQuery = {
  node:
    | { __typename: "Asset" }
    | {
        __typename: "Group";
        id: string;
        schemaId: string;
        projectId: string;
        name: string;
        description: string;
        key: string;
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
              | { __typename: "SchemaFieldDate"; defaultValue: unknown | null }
              | {
                  __typename: "SchemaFieldGeometryEditor";
                  defaultValue: unknown | null;
                  editorSupportedTypes: Array<Types.GeometryEditorSupportedType>;
                }
              | {
                  __typename: "SchemaFieldGeometryObject";
                  defaultValue: unknown | null;
                  objectSupportedTypes: Array<Types.GeometryObjectSupportedType>;
                }
              | { __typename: "SchemaFieldGroup" }
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
              | { __typename: "SchemaFieldReference" }
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
      }
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

export type CreateGroupMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  key: Types.Scalars["String"]["input"];
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type CreateGroupMutation = {
  createGroup: { __typename: "GroupPayload"; group: { __typename: "Group"; id: string } } | null;
};

export type UpdateGroupMutationVariables = Types.Exact<{
  groupId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  key: Types.Scalars["String"]["input"];
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type UpdateGroupMutation = {
  updateGroup: { __typename: "GroupPayload"; group: { __typename: "Group"; id: string } } | null;
};

export type DeleteGroupMutationVariables = Types.Exact<{
  groupId: Types.Scalars["ID"]["input"];
}>;

export type DeleteGroupMutation = {
  deleteGroup: { __typename: "DeleteGroupPayload"; groupId: string } | null;
};

export type CheckGroupKeyAvailabilityQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  key: Types.Scalars["String"]["input"];
}>;

export type CheckGroupKeyAvailabilityQuery = {
  checkGroupKeyAvailability: { __typename: "KeyAvailability"; key: string; available: boolean };
};

export type ModelsByGroupQueryVariables = Types.Exact<{
  groupId: Types.Scalars["ID"]["input"];
}>;

export type ModelsByGroupQuery = {
  modelsByGroup: Array<{ __typename: "Model"; name: string } | null>;
};

export type UpdateGroupsOrderMutationVariables = Types.Exact<{
  groupIds: Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"];
}>;

export type UpdateGroupsOrderMutation = {
  updateGroupsOrder: {
    __typename: "GroupsPayload";
    groups: Array<{ __typename: "Group"; id: string }>;
  } | null;
};

export const GetGroupsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetGroups" },
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
            name: { kind: "Name", value: "groups" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetGroupsQuery, GetGroupsQueryVariables>;
export const GetGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetGroup" },
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
                value: { kind: "EnumValue", value: "Group" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Group" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "schemaId" } },
                      { kind: "Field", name: { kind: "Name", value: "projectId" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
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
                                  { kind: "Field", name: { kind: "Name", value: "description" } },
                                  { kind: "Field", name: { kind: "Name", value: "required" } },
                                  { kind: "Field", name: { kind: "Name", value: "unique" } },
                                  { kind: "Field", name: { kind: "Name", value: "isTitle" } },
                                  { kind: "Field", name: { kind: "Name", value: "multiple" } },
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
                                            name: { kind: "Name", value: "SchemaFieldTextArea" },
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
                                            name: { kind: "Name", value: "SchemaFieldMarkdown" },
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
                                                alias: { kind: "Name", value: "assetDefaultValue" },
                                                name: { kind: "Name", value: "defaultValue" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "SchemaFieldSelect" },
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
                                            name: { kind: "Name", value: "SchemaFieldInteger" },
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
                                            name: { kind: "Name", value: "SchemaFieldDate" },
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
                                              value: "SchemaFieldGeometryObject",
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
                                                alias: {
                                                  kind: "Name",
                                                  value: "objectSupportedTypes",
                                                },
                                                name: { kind: "Name", value: "supportedTypes" },
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
                                              value: "SchemaFieldGeometryEditor",
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
                                                alias: {
                                                  kind: "Name",
                                                  value: "editorSupportedTypes",
                                                },
                                                name: { kind: "Name", value: "supportedTypes" },
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
} as unknown as DocumentNode<GetGroupQuery, GetGroupQueryVariables>;
export const CreateGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createGroup" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
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
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createGroup" },
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
                      name: { kind: "Name", value: "key" },
                      value: { kind: "Variable", name: { kind: "Name", value: "key" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
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
                  name: { kind: "Name", value: "group" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
export const UpdateGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
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
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "groupId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "key" },
                      value: { kind: "Variable", name: { kind: "Name", value: "key" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
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
                  name: { kind: "Name", value: "group" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateGroupMutation, UpdateGroupMutationVariables>;
export const DeleteGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
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
            name: { kind: "Name", value: "deleteGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "groupId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "groupId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const CheckGroupKeyAvailabilityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CheckGroupKeyAvailability" },
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
            name: { kind: "Name", value: "checkGroupKeyAvailability" },
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
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "key" } },
                { kind: "Field", name: { kind: "Name", value: "available" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CheckGroupKeyAvailabilityQuery,
  CheckGroupKeyAvailabilityQueryVariables
>;
export const ModelsByGroupDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ModelsByGroup" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
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
            name: { kind: "Name", value: "modelsByGroup" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "groupId" },
                value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "name" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ModelsByGroupQuery, ModelsByGroupQueryVariables>;
export const UpdateGroupsOrderDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateGroupsOrder" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupIds" } },
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
            name: { kind: "Name", value: "updateGroupsOrder" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "groupIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groupIds" } },
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
                  name: { kind: "Name", value: "groups" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateGroupsOrderMutation, UpdateGroupsOrderMutationVariables>;
