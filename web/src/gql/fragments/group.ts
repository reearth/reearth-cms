import { gql } from "@apollo/client";

export const groupFragment = gql`
  fragment groupFragment on Group {
    id
    schemaId
    projectId
    name
    description
    key
    schema {
      id
    }
    project {
      id
    }
    fields {
      id
    }
`;

export default groupFragment;
