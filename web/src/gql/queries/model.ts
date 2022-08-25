import { gql } from "@apollo/client";

export const GET_MODELS = gql`
  query GetModels($projectId: ID!, $first: Int, $last: Int, $after: Cursor, $before: Cursor) {
    models(projectId: $projectId, first: $first, last: $last, after: $after, before: $before) {
      nodes {
        id
        name
        description
        key
        schema {
          id
          fields {
            id
            type
            title
            description
            required
            unique
          }
        }
      }
    }
  }
`;

export const CREATE_MODEL = gql`
  mutation CreateModel($projectId: ID!, $name: String, $description: String, $key: String) {
    createModel(
      input: { projectId: $projectId, name: $name, description: $description, key: $key }
    ) {
      model {
        id
        name
      }
    }
  }
`;
