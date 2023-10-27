import { gql } from "@apollo/client";

export const GET_VIEWS = gql`
  query GetViews($modelId: ID!) {
    view(modelId: $modelId) {
      id
      name
      modelId
      projectId
      sort {
        field {
          type
          id
        }
        direction
      }
      columns {
        type
        id
      }
      filter {
        ... on BoolFieldCondition {
          fieldId {
            type
            id
          }
          operator
          value
        }
      }
      __typename
    }
    __typename
  }
`;

export const CREATE_VIEW = gql`
  mutation CreateView(
    $projectId: ID!
    $modelId: ID!
    $name: String!
    $sort: ItemSortInput
    $filter: ConditionInput
    $columns: [FieldSelectorInput!]
  ) {
    createView(
      input: {
        projectId: $projectId
        modelId: $modelId
        name: $name
        sort: $sort
        filter: $filter
        columns: $columns
      }
    ) {
      view {
        id
        name
        modelId
        projectId
        sort {
          field {
            type
            id
          }
          direction
        }
        columns {
          type
          id
        }
        filter {
          ... on BoolFieldCondition {
            fieldId {
              type
              id
            }
            operator
            value
          }
        }
        __typename
      }
    }
  }
`;

export const UPDATE_VIEW = gql`
  mutation UpdateView(
    $viewId: ID!
    $name: String!
    $sort: ItemSortInput
    $filter: ConditionInput
    $columns: [FieldSelectorInput!]
  ) {
    updateView(
      input: { viewId: $viewId, name: $name, sort: $sort, filter: $filter, columns: $columns }
    ) {
      view {
        id
        name
        modelId
        projectId
        sort {
          field {
            type
            id
          }
          direction
        }
        columns {
          type
          id
        }
        filter {
          ... on BoolFieldCondition {
            fieldId {
              type
              id
            }
            operator
            value
          }
        }
        __typename
      }
    }
  }
`;

export const DELETE_VIEW = gql`
  mutation DeleteView($viewId: ID!) {
    deleteView(input: { viewId: $viewId }) {
      viewId
    }
  }
`;
