import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { Project as GQLProject } from "@reearth-cms/gql/__generated__/graphql.generated";

export const fromGraphQLProject = (project: GQLProject): Project => ({
  accessibility: project.accessibility
    ? {
        apiKeys:
          project.accessibility.apiKeys?.map(apiKey => ({
            description: apiKey.description,
            id: apiKey.id,
            key: apiKey.key,
            name: apiKey.name,
            publication: {
              publicAssets: apiKey.publication?.publicAssets ?? false,
              publicModels: apiKey.publication?.publicModels ?? [],
            },
          })) ?? [],
        publication: {
          publicAssets: project.accessibility.publication?.publicAssets ?? false,
          publicModels: project.accessibility.publication?.publicModels ?? [],
        },
        visibility: project.accessibility.visibility ?? "PRIVATE",
      }
    : undefined,
  alias: project.alias,
  description: project.description,
  id: project.id,
  license: project.license,
  name: project.name,
  readme: project.readme,
  requestRoles: project.requestRoles ?? [],
});
