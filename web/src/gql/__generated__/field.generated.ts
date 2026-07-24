/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import * as Types from "./graphql.generated";

import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type CorrespondingFieldInput = {
  description: string;
  fieldId?: string | null | undefined;
  key: string;
  required: boolean;
  title: string;
};

export type CreateFieldInput = {
  description?: string | null | undefined;
  groupId?: string | null | undefined;
  isTitle: boolean;
  key: string;
  metadata?: boolean | null | undefined;
  modelId?: string | null | undefined;
  multiple: boolean;
  required: boolean;
  title: string;
  type: SchemaFieldType;
  typeProperty: SchemaFieldTypePropertyInput;
  unique: boolean;
};

export type GeometryEditorSupportedType = "ANY" | "LINESTRING" | "POINT" | "POLYGON";

export type GeometryObjectSupportedType =
  | "GEOMETRYCOLLECTION"
  | "LINESTRING"
  | "MULTILINESTRING"
  | "MULTIPOINT"
  | "MULTIPOLYGON"
  | "POINT"
  | "POLYGON";

export type SchemaFieldAssetInput = {
  defaultValue?: unknown;
};

export type SchemaFieldBoolInput = {
  defaultValue?: unknown;
};

export type SchemaFieldCheckboxInput = {
  defaultValue?: unknown;
};

export type SchemaFieldDateInput = {
  defaultValue?: unknown;
};

export type SchemaFieldGeometryEditorInput = {
  defaultValue?: unknown;
  supportedTypes: Array<GeometryEditorSupportedType>;
};

export type SchemaFieldGeometryObjectInput = {
  defaultValue?: unknown;
  supportedTypes: Array<GeometryObjectSupportedType>;
};

export type SchemaFieldGroupInput = {
  groupId: string;
};

export type SchemaFieldIntegerInput = {
  defaultValue?: unknown;
  max?: number | null | undefined;
  min?: number | null | undefined;
};

export type SchemaFieldNumberInput = {
  defaultValue?: unknown;
  max?: number | null | undefined;
  min?: number | null | undefined;
};

export type SchemaFieldReferenceInput = {
  correspondingField?: CorrespondingFieldInput | null | undefined;
  modelId: string;
  schemaId: string;
};

export type SchemaFieldRichTextInput = {
  defaultValue?: unknown;
  maxLength?: number | null | undefined;
};

export type SchemaFieldSelectInput = {
  defaultValue?: unknown;
  values: Array<string>;
};

export type SchemaFieldTagColor =
  | "BLUE"
  | "CYAN"
  | "GEEKBLUE"
  | "GOLD"
  | "GREEN"
  | "LIME"
  | "MAGENTA"
  | "ORANGE"
  | "PURPLE"
  | "RED"
  | "VOLCANO";

export type SchemaFieldTagInput = {
  defaultValue?: unknown;
  tags: Array<SchemaFieldTagValueInput>;
};

export type SchemaFieldTagValueInput = {
  color?: SchemaFieldTagColor | null | undefined;
  id?: string | null | undefined;
  name?: string | null | undefined;
};

export type SchemaFieldTextAreaInput = {
  defaultValue?: unknown;
  maxLength?: number | null | undefined;
};

export type SchemaFieldTextInput = {
  defaultValue?: unknown;
  maxLength?: number | null | undefined;
};

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

export type SchemaFieldTypePropertyInput = {
  asset?: SchemaFieldAssetInput | null | undefined;
  bool?: SchemaFieldBoolInput | null | undefined;
  checkbox?: SchemaFieldCheckboxInput | null | undefined;
  date?: SchemaFieldDateInput | null | undefined;
  geometryEditor?: SchemaFieldGeometryEditorInput | null | undefined;
  geometryObject?: SchemaFieldGeometryObjectInput | null | undefined;
  group?: SchemaFieldGroupInput | null | undefined;
  integer?: SchemaFieldIntegerInput | null | undefined;
  markdownText?: SchemaMarkdownTextInput | null | undefined;
  number?: SchemaFieldNumberInput | null | undefined;
  reference?: SchemaFieldReferenceInput | null | undefined;
  richText?: SchemaFieldRichTextInput | null | undefined;
  select?: SchemaFieldSelectInput | null | undefined;
  tag?: SchemaFieldTagInput | null | undefined;
  text?: SchemaFieldTextInput | null | undefined;
  textArea?: SchemaFieldTextAreaInput | null | undefined;
  url?: SchemaFieldUrlInput | null | undefined;
};

export type SchemaFieldUrlInput = {
  defaultValue?: unknown;
};

export type SchemaMarkdownTextInput = {
  defaultValue?: unknown;
  maxLength?: number | null | undefined;
};

export type UpdateFieldInput = {
  description?: string | null | undefined;
  fieldId: string;
  groupId?: string | null | undefined;
  isTitle?: boolean | null | undefined;
  key?: string | null | undefined;
  metadata?: boolean | null | undefined;
  modelId?: string | null | undefined;
  multiple?: boolean | null | undefined;
  order?: number | null | undefined;
  required?: boolean | null | undefined;
  title?: string | null | undefined;
  typeProperty?: SchemaFieldTypePropertyInput | null | undefined;
  unique?: boolean | null | undefined;
};

export type CreateFieldMutationVariables = Exact<{
  modelId?: string | null | undefined;
  groupId?: string | null | undefined;
  type: Types.SchemaFieldType;
  title: string;
  metadata?: boolean | null | undefined;
  description?: string | null | undefined;
  key: string;
  multiple: boolean;
  unique: boolean;
  isTitle: boolean;
  required: boolean;
  typeProperty: Types.SchemaFieldTypePropertyInput;
}>;

export type CreateFieldMutation = {
  createField: {
    __typename: "FieldPayload";
    field: { __typename: "SchemaField"; id: string };
  } | null;
};

export type CreateFieldsMutationVariables = Exact<{
  inputs: Array<Types.CreateFieldInput> | Types.CreateFieldInput;
}>;

export type CreateFieldsMutation = {
  createFields: {
    __typename: "FieldsPayload";
    fields: Array<{ __typename: "SchemaField"; id: string }>;
  } | null;
};

export type UpdateFieldMutationVariables = Exact<{
  modelId?: string | null | undefined;
  groupId?: string | null | undefined;
  fieldId: string;
  title: string;
  metadata?: boolean | null | undefined;
  description?: string | null | undefined;
  order?: number | null | undefined;
  key: string;
  multiple: boolean;
  unique: boolean;
  isTitle: boolean;
  required: boolean;
  typeProperty: Types.SchemaFieldTypePropertyInput;
}>;

export type UpdateFieldMutation = {
  updateField: {
    __typename: "FieldPayload";
    field: { __typename: "SchemaField"; id: string };
  } | null;
};

export type UpdateFieldsMutationVariables = Exact<{
  updateFieldInput: Array<Types.UpdateFieldInput> | Types.UpdateFieldInput;
}>;

export type UpdateFieldsMutation = {
  updateFields: {
    __typename: "FieldsPayload";
    fields: Array<{ __typename: "SchemaField"; id: string }>;
  } | null;
};

export type DeleteFieldMutationVariables = Exact<{
  modelId?: string | null | undefined;
  groupId?: string | null | undefined;
  fieldId: string;
  metadata?: boolean | null | undefined;
}>;

export type DeleteFieldMutation = {
  deleteField: { __typename: "DeleteFieldPayload"; fieldId: string } | null;
};

export const CreateFieldDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateField" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "type" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "SchemaFieldType" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "metadata" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "multiple" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "unique" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isTitle" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "required" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "typeProperty" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SchemaFieldTypePropertyInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createField" },
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
                      name: { kind: "Name", value: "groupId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "type" },
                      value: { kind: "Variable", name: { kind: "Name", value: "type" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "title" },
                      value: { kind: "Variable", name: { kind: "Name", value: "title" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "metadata" },
                      value: { kind: "Variable", name: { kind: "Name", value: "metadata" } },
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
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "multiple" },
                      value: { kind: "Variable", name: { kind: "Name", value: "multiple" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "unique" },
                      value: { kind: "Variable", name: { kind: "Name", value: "unique" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "isTitle" },
                      value: { kind: "Variable", name: { kind: "Name", value: "isTitle" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "required" },
                      value: { kind: "Variable", name: { kind: "Name", value: "required" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "typeProperty" },
                      value: { kind: "Variable", name: { kind: "Name", value: "typeProperty" } },
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
                  name: { kind: "Name", value: "field" },
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
} as unknown as DocumentNode<CreateFieldMutation, CreateFieldMutationVariables>;
export const CreateFieldsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateFields" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "inputs" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "CreateFieldInput" } },
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
            name: { kind: "Name", value: "createFields" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "inputs" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fields" },
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
} as unknown as DocumentNode<CreateFieldsMutation, CreateFieldsMutationVariables>;
export const UpdateFieldDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateField" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fieldId" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "metadata" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "description" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "order" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "multiple" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "unique" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isTitle" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "required" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "typeProperty" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "SchemaFieldTypePropertyInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateField" },
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
                      name: { kind: "Name", value: "groupId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "fieldId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "fieldId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "title" },
                      value: { kind: "Variable", name: { kind: "Name", value: "title" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "metadata" },
                      value: { kind: "Variable", name: { kind: "Name", value: "metadata" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: { kind: "Variable", name: { kind: "Name", value: "description" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "order" },
                      value: { kind: "Variable", name: { kind: "Name", value: "order" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "key" },
                      value: { kind: "Variable", name: { kind: "Name", value: "key" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "multiple" },
                      value: { kind: "Variable", name: { kind: "Name", value: "multiple" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "unique" },
                      value: { kind: "Variable", name: { kind: "Name", value: "unique" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "isTitle" },
                      value: { kind: "Variable", name: { kind: "Name", value: "isTitle" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "required" },
                      value: { kind: "Variable", name: { kind: "Name", value: "required" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "typeProperty" },
                      value: { kind: "Variable", name: { kind: "Name", value: "typeProperty" } },
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
                  name: { kind: "Name", value: "field" },
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
} as unknown as DocumentNode<UpdateFieldMutation, UpdateFieldMutationVariables>;
export const UpdateFieldsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateFields" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "updateFieldInput" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "UpdateFieldInput" } },
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
            name: { kind: "Name", value: "updateFields" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: { kind: "Variable", name: { kind: "Name", value: "updateFieldInput" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "fields" },
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
} as unknown as DocumentNode<UpdateFieldsMutation, UpdateFieldsMutationVariables>;
export const DeleteFieldDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteField" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "modelId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fieldId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "metadata" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteField" },
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
                      name: { kind: "Name", value: "groupId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "groupId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "fieldId" },
                      value: { kind: "Variable", name: { kind: "Name", value: "fieldId" } },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "metadata" },
                      value: { kind: "Variable", name: { kind: "Name", value: "metadata" } },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "fieldId" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteFieldMutation, DeleteFieldMutationVariables>;
