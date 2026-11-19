import { gql } from "@apollo/client";

import { integrationFragment } from "@reearth-cms/gql/fragments";

export const workspaceFragment = gql`
  fragment WorkspaceFragment on Workspace {
    id
    name
    alias
    members {
      ... on WorkspaceUserMember {
        user {
          id
          name
        }
        userId
        role
      }
      ... on WorkspaceIntegrationMember {
        integrationId
        integration {
          ...integrationFragment
        }
        role
        active
        invitedBy {
          id
          name
        }
        invitedById
      }
    }
    personal
  }
  ${integrationFragment}
`;

export default workspaceFragment;
