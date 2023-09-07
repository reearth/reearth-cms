import { gql } from "@apollo/client";

export const CREATE_FIELD = gql`
  mutation CreateField(
    $modelId: ID!
    $type: SchemaFieldType!
    $title: String!
    $metadata: Boolean
    $description: String
    $key: String!
    $multiple: Boolean!
    $unique: Boolean!
    $isTitle: Boolean!
    $required: Boolean!
    $typeProperty: SchemaFieldTypePropertyInput!
  ) {
    createField(
      input: {
        modelId: $modelId
        type: $type
        title: $title
        metadata: $metadata
        description: $description
        key: $key
        multiple: $multiple
        unique: $unique
        isTitle: $isTitle
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
    $metadata: Boolean
    $description: String
    $order: Int
    $key: String!
    $multiple: Boolean!
    $unique: Boolean!
    $isTitle: Boolean!
    $required: Boolean!
    $typeProperty: SchemaFieldTypePropertyInput!
  ) {
    updateField(
      input: {
        modelId: $modelId
        fieldId: $fieldId
        title: $title
        metadata: $metadata
        description: $description
        order: $order
        key: $key
        multiple: $multiple
        unique: $unique
        isTitle: $isTitle
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

export const UPDATE_FIELDS = gql`
  mutation UpdateFields($updateFieldInput: [UpdateFieldInput!]!) {
    updateFields(input: $updateFieldInput) {
      fields {
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
