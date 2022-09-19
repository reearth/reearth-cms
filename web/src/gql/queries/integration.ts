import { gql } from "@apollo/client";

export const CREATE_INTEGRATION = gql`
  mutation CreateIntegration(
    $name: String!
    $description: String
    $logoUrl: URL!
    $type: IntegrationType!
  ) {
    createIntegration(
      input: { name: $name, description: $description, logoUrl: $logoUrl, type: $type }
    ) {
      integration {
        id
        name
        description
        logoUrl
        iType
      }
    }
  }
`;
