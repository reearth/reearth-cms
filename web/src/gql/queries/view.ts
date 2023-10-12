import { gql } from "@apollo/client";

export const GET_VIEWS = gql`
  query GetViews($modelId: ID!) {
    view(modelId: $modelId) {
      id
      name
      modelId
      projectId
    }
  }
`;

export const CREATE_VIEW = gql`
  mutation CreateView($projectId: ID!, $modelId: ID!, $name: String!) {
    createView(input: { projectId: $projectId, modelId: $modelId, name: $name }) {
      view {
        id
        name
        __typename
      }
      __typename
    }
  }
`;

export const UPDATE_VIEW = gql`
  mutation UpdateView($viewId: ID!, $name: String!) {
    updateView(input: { viewId: $viewId, name: $name }) {
      view {
        id
        name
        __typename
      }
      __typename
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
