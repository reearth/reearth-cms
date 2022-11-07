import { gql } from "@apollo/client";

export const CREATE_FIELD = gql`
  mutation CreateField(
    $modelId: ID!
    $type: SchemaFiledType!
    $title: String!
    $description: String
    $key: String!
    $multiValue: Boolean!
    $unique: Boolean!
    $required: Boolean!
    $typeProperty: SchemaFieldTypePropertyInput!
  ) {
    createField(
      input: {
        modelId: $modelId
        type: $type
        title: $title
        description: $description
        key: $key
        multiValue: $multiValue
        unique: $unique
        required: $required
        typeProperty: $typeProperty
      }
    ) {
      field {
        id
      }
    }
  }
`;

export const UPDATE_FIELD = gql`
  mutation UpdateField(
    $modelId: ID!
    $fieldId: ID!
    $title: String!
    $description: String
    $key: String!
    $multiValue: Boolean!
    $unique: Boolean!
    $required: Boolean!
    $typeProperty: SchemaFieldTypePropertyInput!
  ) {
    updateField(
      input: {
        modelId: $modelId
        fieldId: $fieldId
        title: $title
        description: $description
        key: $key
        multiValue: $multiValue
        unique: $unique
        required: $required
        typeProperty: $typeProperty
      }
    ) {
      field {
        id
      }
    }
  }
`;

export const DELETE_FIELD = gql`
  mutation DeleteField($modelId: ID!, $fieldId: ID!) {
    deleteField(input: { modelId: $modelId, fieldId: $fieldId }) {
      fieldId
    }
  }
`;
