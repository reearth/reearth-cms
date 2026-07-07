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

export type ColumnSelectionInput = {
  field: FieldSelectorInput;
  visible: boolean;
};

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

export type ItemSortInput = {
  direction?: SortDirection | null | undefined;
  field: FieldSelectorInput;
};

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

export type GetViewsQueryVariables = Exact<{
  modelId: string;
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

export type CreateViewMutationVariables = Exact<{
  projectId: string;
  modelId: string;
  name: string;
  sort?: Types.ItemSortInput | null | undefined;
  filter?: Types.ConditionInput | null | undefined;
  columns?: Array<Types.ColumnSelectionInput> | Types.ColumnSelectionInput | null | undefined;
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

export type UpdateViewMutationVariables = Exact<{
  viewId: string;
  name: string;
  sort?: Types.ItemSortInput | null | undefined;
  filter?: Types.ConditionInput | null | undefined;
  columns?: Array<Types.ColumnSelectionInput> | Types.ColumnSelectionInput | null | undefined;
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

export type DeleteViewMutationVariables = Exact<{
  viewId: string;
}>;

export type DeleteViewMutation = {
  deleteView: { __typename: "DeleteViewPayload"; viewId: string } | null;
};

export type UpdateViewsOrderMutationVariables = Exact<{
  viewIds: Array<string> | string;
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
