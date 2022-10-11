import { gql } from "@apollo/client";

export const GET_ITEMS = gql`
  query GetItems($schemaID: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
    items(schemaID: $schemaID, first: $first, last: $last, after: $after, before: $before) {
      nodes {
        id
        schemaID
        fields {
          schemaFieldID
          type
          value
        }
      }
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($schemaID: ID!, $fields: [ItemFieldInput!]!) {
    createItem(input: { schemaID: $schemaID, fields: $fields }) {
      item {
        id
        schemaID
        fields {
          value
          type
          schemaFieldID
        }
      }
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($itemID: ID!) {
    deleteItem(input: { itemID: $itemID }) {
      itemID
    }
  }
`;

export const UPDATE_ITEM = gql`
  mutation UpdateItem($itemID: ID!, $fields: [ItemFieldInput!]!) {
    updateItem(input: { itemID: $itemID, fields: $fields }) {
      item {
        id
        schemaID
        fields {
          value
          type
          schemaFieldID
        }
      }
    }
  }
`;
