import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { Project as GQLProject } from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLProject = (project: GQLProject): Project => ({
  id: project.id,
  name: project.name,
  description: project.description,
  alias: project.alias,
  readme: project.readme,
  license: project.license,
  requestRoles: project.requestRoles ?? [],
  accessibility: project.accessibility
    ? {
        visibility: project.accessibility.visibility ?? "PRIVATE",
        publication: {
          publicModels: project.accessibility.publication?.publicModels ?? [],
          publicAssets: project.accessibility.publication?.publicAssets ?? false,
        },
        apiKeys:
          project.accessibility.apiKeys?.map(apiKey => ({
            id: apiKey.id,
            name: apiKey.name,
            description: apiKey.description,
            key: apiKey.key,
            publication: {
              publicModels: apiKey.publication?.publicModels ?? [],
              publicAssets: apiKey.publication?.publicAssets ?? false,
            },
          })) ?? [],
      }
    : undefined,
});
