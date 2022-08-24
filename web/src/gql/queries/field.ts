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
