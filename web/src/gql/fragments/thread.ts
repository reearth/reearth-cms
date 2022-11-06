import { gql } from "@apollo/client";

export const threadFragment = gql`
  fragment threadFragment on Thread {
    id
    workspaceId
    comments {
      id
      content
      author {
        id
        name
        email
      }
      createdAt
    }
  }
`;

export default threadFragment;
