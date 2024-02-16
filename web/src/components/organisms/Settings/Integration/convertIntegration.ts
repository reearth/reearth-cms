import { Integration as GQLIntegration } from "@reearth-cms/gql/graphql-client-api";

export const fromIntegration = (integration: GQLIntegration) => ({
  id: integration.id,
  name: integration.name,
  description: integration.description,
  logoUrl: integration.logoUrl,
  developerId: integration.developerId,
  developer: integration.developer,
  iType: integration.iType,
  config: {
    token: integration.config?.token,
    webhooks: integration.config?.webhooks,
  },
});
