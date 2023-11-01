import { gql } from "@apollo/client";

import { threadFragment } from "@reearth-cms/gql/fragments";

export const GET_ITEMS = gql`
  query GetItems($query: ItemQueryInput!, $pagination: Pagination) {
    searchItem(input: { query: $query, pagination: $pagination }) {
      nodes {
        id
        title
        schemaId
        createdAt
        updatedAt
        status
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        fields {
          schemaFieldId
          itemGroupId
          type
          value
        }
        thread {
          ...threadFragment
        }
        metadata {
          id
          fields {
            schemaFieldId
            itemGroupId
            type
            value
          }
        }
      }
      totalCount
    }
  }

  ${threadFragment}
`;

export const GET_ITEM_NODE = gql`
  query GetItem($id: ID!) {
    node(id: $id, type: Item) {
      ... on Item {
        id
        title
        schemaId
        createdAt
        updatedAt
        status
        version
        assets {
          id
          url
        }
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        updatedBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        fields {
          schemaFieldId
          itemGroupId
          type
          value
        }
        metadata {
          id
          fields {
            schemaFieldId
            type
            value
          }
        }
        thread {
          ...threadFragment
        }
      }
    }
  }
`;

export const IS_ITEM_REFERENCED = gql`
  query IsItemReferenced($itemId: ID!, $correspondingFieldId: ID!) {
    isItemReferenced(itemId: $itemId, correspondingFieldId: $correspondingFieldId)
  }
`;

export const GET_ITEMS_BY_IDS = gql`
  query GetItemsByIds($id: [ID!]!) {
    nodes(id: $id, type: Item) {
      ... on Item {
        id
        title
        schemaId
        createdAt
        updatedAt
        status
      }
    }
  }
`;

export const SEARCH_ITEM = gql`
  query SearchItem($searchItemInput: SearchItemInput!) {
    searchItem(input: $searchItemInput) {
      nodes {
        id
        title
        schemaId
        createdAt
        updatedAt
        status
        version
        assets {
          id
          url
        }
        fields {
          schemaFieldId
          itemGroupId
          type
          value
        }
        createdBy {
          ... on Integration {
            name
          }
          ... on User {
            name
          }
        }
        updatedBy {
          ... on Integration {
            name
            __typename
          }
          ... on User {
            name
            __typename
          }
        }
        metadata {
          id
          fields {
            schemaFieldId
            type
            value
          }
        }
        thread {
          ...threadFragment
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }

  ${threadFragment}
`;

export const CREATE_ITEM = gql`
  mutation CreateItem($modelId: ID!, $schemaId: ID!, $metadataId: ID, $fields: [ItemFieldInput!]!) {
    createItem(
      input: { modelId: $modelId, schemaId: $schemaId, metadataId: $metadataId, fields: $fields }
    ) {
      item {
        id
        schemaId
        fields {
          value
          type
          schemaFieldId
          itemGroupId
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
  mutation UpdateItem(
    $itemId: ID!
    $fields: [ItemFieldInput!]!
    $metadataId: ID
    $version: String!
  ) {
    updateItem(
      input: { itemId: $itemId, fields: $fields, metadataId: $metadataId, version: $version }
    ) {
      item {
        id
        schemaId
        fields {
          value
          type
          schemaFieldId
          itemGroupId
        }
      }
    }
  }
`;

export const UNPUBLISH_ITEM = gql`
  mutation UnpublishItem($itemIds: [ID!]!) {
    unpublishItem(input: { itemIds: $itemIds }) {
      items {
        id
      }
    }
  }
`;

export const PUBLISH_ITEM = gql`
  mutation PublishItem($itemIds: [ID!]!) {
    publishItem(input: { itemIds: $itemIds }) {
      items {
        id
      }
    }
  }
`;
