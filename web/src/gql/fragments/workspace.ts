import { gql } from "@apollo/client";

export const workspaceFragment = gql`
  fragment WorkspaceFragment on Workspace {
    id
    name
    members {
      user {
        id
        name
        email
      }
      userId
      role
    }
    personal
  }
`;

export default workspaceFragment;
