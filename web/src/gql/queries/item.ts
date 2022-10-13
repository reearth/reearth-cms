import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query GetItems($schemaId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
    items(schemaId: $schemaId, first: $first, last: $last, after: $after, before: $before) {
      nodes {
        id
        schemaId
        fields {
          schemaFieldId
          type
          value
        }
      }
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($schemaId: ID!, $fields: [ItemFieldInput!]!) {
    createItem(input: { schemaId: $schemaId, fields: $fields }) {
      item {
        id
        schemaId
        fields {
          value
          type
          schemaFieldId
        }
      }
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($itemId: ID!) {
    deleteItem(input: { itemId: $itemId }) {
      itemId
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem($itemId: ID!, $fields: [ItemFieldInput!]!) {
    updateItem(input: { itemId: $itemId, fields: $fields }) {
      item {
        id
        schemaId
        fields {
          value
          type
          schemaFieldId
        }
      }
    }
  }
`;
