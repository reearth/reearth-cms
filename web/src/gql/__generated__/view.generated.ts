import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetViewsQueryVariables = Types.Exact<{
  modelId: Types.Scalars["ID"]["input"];
}>;

export type GetViewsQuery = {
  __typename: "Query";
  view: Array<{
    __typename: "View";
    id: string;
    name: string;
    modelId: string;
    projectId: string;
    order: number;
    sort: {
      __typename: "ItemSort";
      direction: Types.SortDirection | null;
      field: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
    } | null;
    columns: Array<{
      __typename: "Column";
      visible: boolean;
      field: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
    }> | null;
    filter:
      | {
          __typename: "AndCondition";
          conditions: Array<
            | { __typename: "AndCondition" }
            | {
                __typename: "BasicFieldCondition";
                basicOperator: Types.BasicOperator;
                basicValue: unknown;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
            | {
                __typename: "BoolFieldCondition";
                boolOperator: Types.BoolOperator;
                boolValue: boolean;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
            | {
                __typename: "MultipleFieldCondition";
                multipleOperator: Types.MultipleOperator;
                multipleValue: Array<unknown>;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
            | {
                __typename: "NullableFieldCondition";
                nullableOperator: Types.NullableOperator;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
            | {
                __typename: "NumberFieldCondition";
                numberOperator: Types.NumberOperator;
                numberValue: number;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
            | { __typename: "OrCondition" }
            | {
                __typename: "StringFieldCondition";
                stringOperator: Types.StringOperator;
                stringValue: string;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
            | {
                __typename: "TimeFieldCondition";
                timeOperator: Types.TimeOperator;
                timeValue: Date;
                fieldId: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
              }
          >;
        }
      | { __typename: "BasicFieldCondition" }
      | { __typename: "BoolFieldCondition" }
      | { __typename: "MultipleFieldCondition" }
      | { __typename: "NullableFieldCondition" }
      | { __typename: "NumberFieldCondition" }
      | { __typename: "OrCondition" }
      | { __typename: "StringFieldCondition" }
      | { __typename: "TimeFieldCondition" }
      | null;
  }>;
};

export type CreateViewMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  modelId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  sort?: Types.InputMaybe<Types.ItemSortInput>;
  filter?: Types.InputMaybe<Types.ConditionInput>;
  columns?: Types.InputMaybe<Array<Types.ColumnSelectionInput> | Types.ColumnSelectionInput>;
}>;

export type CreateViewMutation = {
  createView: {
    __typename: "ViewPayload";
    view: {
      __typename: "View";
      id: string;
      name: string;
      modelId: string;
      projectId: string;
      sort: {
        __typename: "ItemSort";
        direction: Types.SortDirection | null;
        field: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
      } | null;
      columns: Array<{
        __typename: "Column";
        visible: boolean;
        field: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
      }> | null;
      filter:
        | {
            __typename: "AndCondition";
            conditions: Array<
              | { __typename: "AndCondition" }
              | {
                  __typename: "BasicFieldCondition";
                  basicOperator: Types.BasicOperator;
                  basicValue: unknown;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "BoolFieldCondition";
                  boolOperator: Types.BoolOperator;
                  boolValue: boolean;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "MultipleFieldCondition";
                  multipleOperator: Types.MultipleOperator;
                  multipleValue: Array<unknown>;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "NullableFieldCondition";
                  nullableOperator: Types.NullableOperator;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "NumberFieldCondition";
                  numberOperator: Types.NumberOperator;
                  numberValue: number;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | { __typename: "OrCondition" }
              | {
                  __typename: "StringFieldCondition";
                  stringOperator: Types.StringOperator;
                  stringValue: string;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "TimeFieldCondition";
                  timeOperator: Types.TimeOperator;
                  timeValue: Date;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
            >;
          }
        | { __typename: "BasicFieldCondition" }
        | { __typename: "BoolFieldCondition" }
        | { __typename: "MultipleFieldCondition" }
        | { __typename: "NullableFieldCondition" }
        | { __typename: "NumberFieldCondition" }
        | { __typename: "OrCondition" }
        | { __typename: "StringFieldCondition" }
        | { __typename: "TimeFieldCondition" }
        | null;
    };
  } | null;
};

export type UpdateViewMutationVariables = Types.Exact<{
  viewId: Types.Scalars["ID"]["input"];
  name: Types.Scalars["String"]["input"];
  sort?: Types.InputMaybe<Types.ItemSortInput>;
  filter?: Types.InputMaybe<Types.ConditionInput>;
  columns?: Types.InputMaybe<Array<Types.ColumnSelectionInput> | Types.ColumnSelectionInput>;
}>;

export type UpdateViewMutation = {
  updateView: {
    __typename: "ViewPayload";
    view: {
      __typename: "View";
      id: string;
      name: string;
      modelId: string;
      projectId: string;
      sort: {
        __typename: "ItemSort";
        direction: Types.SortDirection | null;
        field: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
      } | null;
      columns: Array<{
        __typename: "Column";
        visible: boolean;
        field: { __typename: "FieldSelector"; type: Types.FieldType; id: string | null };
      }> | null;
      filter:
        | {
            __typename: "AndCondition";
            conditions: Array<
              | { __typename: "AndCondition" }
              | {
                  __typename: "BasicFieldCondition";
                  basicOperator: Types.BasicOperator;
                  basicValue: unknown;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "BoolFieldCondition";
                  boolOperator: Types.BoolOperator;
                  boolValue: boolean;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "MultipleFieldCondition";
                  multipleOperator: Types.MultipleOperator;
                  multipleValue: Array<unknown>;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "NullableFieldCondition";
                  nullableOperator: Types.NullableOperator;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "NumberFieldCondition";
                  numberOperator: Types.NumberOperator;
                  numberValue: number;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | { __typename: "OrCondition" }
              | {
                  __typename: "StringFieldCondition";
                  stringOperator: Types.StringOperator;
                  stringValue: string;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
              | {
                  __typename: "TimeFieldCondition";
                  timeOperator: Types.TimeOperator;
                  timeValue: Date;
                  fieldId: {
                    __typename: "FieldSelector";
                    type: Types.FieldType;
                    id: string | null;
                  };
                }
            >;
          }
        | { __typename: "BasicFieldCondition" }
        | { __typename: "BoolFieldCondition" }
        | { __typename: "MultipleFieldCondition" }
        | { __typename: "NullableFieldCondition" }
        | { __typename: "NumberFieldCondition" }
        | { __typename: "OrCondition" }
        | { __typename: "StringFieldCondition" }
        | { __typename: "TimeFieldCondition" }
        | null;
    };
  } | null;
};

export type DeleteViewMutationVariables = Types.Exact<{
  viewId: Types.Scalars["ID"]["input"];
}>;

export type DeleteViewMutation = {
  deleteView: { __typename: "DeleteViewPayload"; viewId: string } | null;
};

export type UpdateViewsOrderMutationVariables = Types.Exact<{
  viewIds: Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"];
}>;

export type UpdateViewsOrderMutation = {
  updateViewsOrder: {
    __typename: "ViewsPayload";
    views: Array<{ __typename: "View"; id: string }>;
  } | null;
};

export const GetViewsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetViews" },
      variableDefinitions: [
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
            name: { kind: "Name", value: "view" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "modelId" },
                value: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "modelId" } },
                { kind: "Field", name: { kind: "Name", value: "projectId" } },
                { kind: "Field", name: { kind: "Name", value: "order" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sort" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "field" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "direction" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "columns" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "field" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                          ],
                        },
                      },
                      { kind: "Field", name: { kind: "Name", value: "visible" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "filter" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "AndCondition" },
                        },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "conditions" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "BasicFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "basicOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "basicValue" },
                                          name: { kind: "Name", value: "value" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "NullableFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "nullableOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "MultipleFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "multipleOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "multipleValue" },
                                          name: { kind: "Name", value: "value" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "BoolFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "boolOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "boolValue" },
                                          name: { kind: "Name", value: "value" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "StringFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "stringOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "stringValue" },
                                          name: { kind: "Name", value: "value" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "NumberFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "numberOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "numberValue" },
                                          name: { kind: "Name", value: "value" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "InlineFragment",
                                    typeCondition: {
                                      kind: "NamedType",
                                      name: { kind: "Name", value: "TimeFieldCondition" },
                                    },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "fieldId" },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "type" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "id" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "timeOperator" },
                                          name: { kind: "Name", value: "operator" },
                                        },
                                        {
                                          kind: "Field",
                                          alias: { kind: "Name", value: "timeValue" },
                                          name: { kind: "Name", value: "value" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
                                        },
                                      ],
                                    },
                                  },
                                  { kind: "Field", name: { kind: "Name", value: "__typename" } },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetViewsQuery, GetViewsQueryVariables>;
export const CreateViewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateView" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ItemSortInput" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "filter" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ConditionInput" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "columns" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ColumnSelectionInput" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createView" },
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
                      name: { kind: "Name", value: "modelId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "filter" },
                      value: { kind: "Variable", name: { kind: "Name", value: "filter" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "columns" },
                      value: { kind: "Variable", name: { kind: "Name", value: "columns" } },
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
                  name: { kind: "Name", value: "view" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "modelId" } },
                      { kind: "Field", name: { kind: "Name", value: "projectId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sort" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "field" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "direction" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "columns" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "field" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "visible" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filter" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: { kind: "Name", value: "AndCondition" },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "conditions" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "BasicFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "basicOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "basicValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "NullableFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "nullableOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "MultipleFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "multipleOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "multipleValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "BoolFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "boolOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "boolValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "StringFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "stringOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "stringValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "NumberFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "numberOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "numberValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "TimeFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "timeOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "timeValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
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
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
} as unknown as DocumentNode<CreateViewMutation, CreateViewMutationVariables>;
export const UpdateViewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateView" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "viewId" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "sort" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ItemSortInput" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "filter" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ConditionInput" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "columns" } },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: { kind: "NamedType", name: { kind: "Name", value: "ColumnSelectionInput" } },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateView" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "viewId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "viewId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "sort" },
                      value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "filter" },
                      value: { kind: "Variable", name: { kind: "Name", value: "filter" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "columns" },
                      value: { kind: "Variable", name: { kind: "Name", value: "columns" } },
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
                  name: { kind: "Name", value: "view" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "modelId" } },
                      { kind: "Field", name: { kind: "Name", value: "projectId" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "sort" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "field" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "direction" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "columns" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "field" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  { kind: "Field", name: { kind: "Name", value: "type" } },
                                  { kind: "Field", name: { kind: "Name", value: "id" } },
                                ],
                              },
                            },
                            { kind: "Field", name: { kind: "Name", value: "visible" } },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filter" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "InlineFragment",
                              typeCondition: {
                                kind: "NamedType",
                                name: { kind: "Name", value: "AndCondition" },
                              },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "conditions" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "BasicFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "basicOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "basicValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "NullableFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "nullableOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "MultipleFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "multipleOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "multipleValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "BoolFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "boolOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "boolValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "StringFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "stringOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "stringValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "NumberFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "numberOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "numberValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "InlineFragment",
                                          typeCondition: {
                                            kind: "NamedType",
                                            name: { kind: "Name", value: "TimeFieldCondition" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "fieldId" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "timeOperator" },
                                                name: { kind: "Name", value: "operator" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "timeValue" },
                                                name: { kind: "Name", value: "value" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "__typename" },
                                              },
                                            ],
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "__typename" },
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
                      { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
} as unknown as DocumentNode<UpdateViewMutation, UpdateViewMutationVariables>;
export const DeleteViewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteView" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "viewId" } },
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
            name: { kind: "Name", value: "deleteView" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "viewId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "viewId" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "viewId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteViewMutation, DeleteViewMutationVariables>;
export const UpdateViewsOrderDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateViewsOrder" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "viewIds" } },
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
            name: { kind: "Name", value: "updateViewsOrder" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "viewIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "viewIds" } },
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
                  name: { kind: "Name", value: "views" },
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
} as unknown as DocumentNode<UpdateViewsOrderMutation, UpdateViewsOrderMutationVariables>;
