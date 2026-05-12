import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type GetModelsQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  keyword?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  sort?: Types.InputMaybe<Types.Sort>;
  pagination?: Types.InputMaybe<Types.Pagination>;
}>;

export type GetModelsQuery = {
  models: {
    __typename: "ModelConnection";
    nodes: Array<{
      __typename: "Model";
      id: string;
      name: string;
      description: string;
      key: string;
      order: number | null;
      createdAt: Date;
      updatedAt: Date;
      schema: {
        __typename: "Schema";
        id: string;
        fields: Array<{ __typename: "SchemaField"; id: string; type: Types.SchemaFieldType }>;
      };
    } | null>;
  };
};

export type GetModelQueryVariables = Types.Exact<{
  id: Types.Scalars["ID"]["input"];
}>;

export type GetModelQuery = {
  node:
    | { __typename: "Asset" }
    | { __typename: "Group" }
    | { __typename: "Integration" }
    | { __typename: "Item" }
    | { __typename: "Job" }
    | {
        __typename: "Model";
        id: string;
        name: string;
        description: string;
        key: string;
        order: number | null;
        metadataSchema: {
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
            order: number | null;
            typeProperty:
              | { __typename: "SchemaFieldAsset" }
              | { __typename: "SchemaFieldBool"; defaultValue: unknown | null }
              | { __typename: "SchemaFieldCheckbox"; defaultValue: unknown | null }
              | { __typename: "SchemaFieldDate"; defaultValue: unknown | null }
              | { __typename: "SchemaFieldGeometryEditor" }
              | { __typename: "SchemaFieldGeometryObject" }
              | { __typename: "SchemaFieldGroup" }
              | { __typename: "SchemaFieldInteger" }
              | { __typename: "SchemaFieldMarkdown" }
              | { __typename: "SchemaFieldNumber" }
              | { __typename: "SchemaFieldReference" }
              | { __typename: "SchemaFieldRichText" }
              | { __typename: "SchemaFieldSelect" }
              | {
                  __typename: "SchemaFieldTag";
                  selectDefaultValue: unknown | null;
                  tags: Array<{
                    __typename: "SchemaFieldTagValue";
                    id: string;
                    name: string;
                    color: Types.SchemaFieldTagColor;
                  }>;
                }
              | {
                  __typename: "SchemaFieldText";
                  defaultValue: unknown | null;
                  maxLength: number | null;
                }
              | { __typename: "SchemaFieldTextArea" }
              | { __typename: "SchemaFieldURL"; defaultValue: unknown | null }
              | null;
          }>;
        } | null;
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
            order: number | null;
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
              | {
                  __typename: "SchemaFieldNumber";
                  defaultValue: unknown | null;
                  numberMin: number | null;
                  numberMax: number | null;
                }
              | {
                  __typename: "SchemaFieldReference";
                  modelId: string;
                  schema: { __typename: "Schema"; id: string; titleFieldId: string | null };
                  correspondingField: {
                    __typename: "SchemaField";
                    id: string;
                    type: Types.SchemaFieldType;
                    title: string;
                    key: string;
                    description: string | null;
                    required: boolean;
                    unique: boolean;
                    multiple: boolean;
                    order: number | null;
                  } | null;
                }
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
    | { __typename: "Project" }
    | { __typename: "Request" }
    | { __typename: "Schema" }
    | { __typename: "User" }
    | { __typename: "View" }
    | { __typename: "Workspace" }
    | { __typename: "WorkspaceSettings" }
    | null;
};

export type CreateModelMutationVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  name?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  key?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type CreateModelMutation = {
  createModel: {
    __typename: "ModelPayload";
    model: { __typename: "Model"; id: string; name: string };
  } | null;
};

export type DeleteModelMutationVariables = Types.Exact<{
  modelId: Types.Scalars["ID"]["input"];
}>;

export type DeleteModelMutation = {
  deleteModel: { __typename: "DeleteModelPayload"; modelId: string } | null;
};

export type UpdateModelMutationVariables = Types.Exact<{
  modelId: Types.Scalars["ID"]["input"];
  name?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  description?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  key?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type UpdateModelMutation = {
  updateModel: {
    __typename: "ModelPayload";
    model: { __typename: "Model"; id: string; name: string };
  } | null;
};

export type CheckModelKeyAvailabilityQueryVariables = Types.Exact<{
  projectId: Types.Scalars["ID"]["input"];
  key: Types.Scalars["String"]["input"];
}>;

export type CheckModelKeyAvailabilityQuery = {
  checkModelKeyAvailability: { __typename: "KeyAvailability"; key: string; available: boolean };
};

export type UpdateModelsOrderMutationVariables = Types.Exact<{
  modelIds: Array<Types.Scalars["ID"]["input"]> | Types.Scalars["ID"]["input"];
}>;

export type UpdateModelsOrderMutation = {
  updateModelsOrder: {
    __typename: "ModelsPayload";
    models: Array<{ __typename: "Model"; id: string }>;
  } | null;
};

export type ExportModelMutationVariables = Types.Exact<{
  modelId: Types.Scalars["ID"]["input"];
  format: Types.ExportFormat;
}>;

export type ExportModelMutation = {
  exportModel: { __typename: "ExportModelPayload"; modelId: string; url: string } | null;
};

export type ExportModelSchemaMutationVariables = Types.Exact<{
  modelId: Types.Scalars["ID"]["input"];
}>;

export type ExportModelSchemaMutation = {
  exportModelSchema: {
    __typename: "ExportModelSchemaPayload";
    modelId: string;
    url: string;
  } | null;
};

export const GetModelsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetModels" },
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
          type: { kind: "NamedType", name: { kind: "Name", value: "Sort" } },
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
            name: { kind: "Name", value: "models" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "projectId" },
                value: { kind: "Variable", name: { kind: "Name", value: "projectId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "keyword" },
                value: { kind: "Variable", name: { kind: "Name", value: "keyword" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sort" },
                value: { kind: "Variable", name: { kind: "Name", value: "sort" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "pagination" },
                value: { kind: "Variable", name: { kind: "Name", value: "pagination" } },
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
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "order" } },
                      { kind: "Field", name: { kind: "Name", value: "createdAt" } },
                      { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
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
} as unknown as DocumentNode<GetModelsQuery, GetModelsQueryVariables>;
export const GetModelDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetModel" },
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
                value: { kind: "EnumValue", value: "Model" },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "InlineFragment",
                  typeCondition: { kind: "NamedType", name: { kind: "Name", value: "Model" } },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      { kind: "Field", name: { kind: "Name", value: "description" } },
                      { kind: "Field", name: { kind: "Name", value: "key" } },
                      { kind: "Field", name: { kind: "Name", value: "order" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "metadataSchema" },
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
                                  { kind: "Field", name: { kind: "Name", value: "order" } },
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
                                            name: { kind: "Name", value: "SchemaFieldCheckbox" },
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
                                            name: { kind: "Name", value: "SchemaFieldTag" },
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
                                                name: { kind: "Name", value: "tags" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "name" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "color" },
                                                    },
                                                  ],
                                                },
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
                                  { kind: "Field", name: { kind: "Name", value: "order" } },
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
                                            name: { kind: "Name", value: "SchemaFieldNumber" },
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
                                                alias: { kind: "Name", value: "numberMin" },
                                                name: { kind: "Name", value: "min" },
                                              },
                                              {
                                                kind: "Field",
                                                alias: { kind: "Name", value: "numberMax" },
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
                                            name: { kind: "Name", value: "SchemaFieldReference" },
                                          },
                                          selectionSet: {
                                            kind: "SelectionSet",
                                            selections: [
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "modelId" },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "schema" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "titleFieldId" },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: "Field",
                                                name: { kind: "Name", value: "correspondingField" },
                                                selectionSet: {
                                                  kind: "SelectionSet",
                                                  selections: [
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "id" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "type" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "title" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "key" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "description" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "required" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "unique" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "multiple" },
                                                    },
                                                    {
                                                      kind: "Field",
                                                      name: { kind: "Name", value: "order" },
                                                    },
                                                  ],
                                                },
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
} as unknown as DocumentNode<GetModelQuery, GetModelQueryVariables>;
export const CreateModelDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateModel" },
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
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createModel" },
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
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "key" },
                      value: { kind: "Variable", name: { kind: "Name", value: "key" } },
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
                  name: { kind: "Name", value: "model" },
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateModelMutation, CreateModelMutationVariables>;
export const DeleteModelDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteModel" },
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
            name: { kind: "Name", value: "deleteModel" },
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
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "modelId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteModelMutation, DeleteModelMutationVariables>;
export const UpdateModelDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateModel" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "key" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateModel" },
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
                      name: { kind: "Name", value: "name" },
                      value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "key" },
                      value: { kind: "Variable", name: { kind: "Name", value: "key" } },
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
                  name: { kind: "Name", value: "model" },
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateModelMutation, UpdateModelMutationVariables>;
export const CheckModelKeyAvailabilityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CheckModelKeyAvailability" },
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
            name: { kind: "Name", value: "checkModelKeyAvailability" },
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
  CheckModelKeyAvailabilityQuery,
  CheckModelKeyAvailabilityQueryVariables
>;
export const UpdateModelsOrderDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateModelsOrder" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "modelIds" } },
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
            name: { kind: "Name", value: "updateModelsOrder" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "modelIds" },
                      value: { kind: "Variable", name: { kind: "Name", value: "modelIds" } },
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
                  name: { kind: "Name", value: "models" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "InlineFragment",
                        typeCondition: {
                          kind: "NamedType",
                          name: { kind: "Name", value: "Model" },
                        },
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
      },
    },
  ],
} as unknown as DocumentNode<UpdateModelsOrderMutation, UpdateModelsOrderMutationVariables>;
export const ExportModelDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ExportModel" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "format" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ExportFormat" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "exportModel" },
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
                      name: { kind: "Name", value: "format" },
                      value: { kind: "Variable", name: { kind: "Name", value: "format" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "modelId" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExportModelMutation, ExportModelMutationVariables>;
export const ExportModelSchemaDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "ExportModelSchema" },
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
            name: { kind: "Name", value: "exportModelSchema" },
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
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "modelId" } },
                { kind: "Field", name: { kind: "Name", value: "url" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ExportModelSchemaMutation, ExportModelSchemaMutationVariables>;
