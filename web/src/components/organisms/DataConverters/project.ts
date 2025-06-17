import { Project } from "@reearth-cms/components/molecules/Workspace/types";
import { Project as GQLProject } from "@reearth-cms/gql/graphql-client-api";

export const fromGraphQLProject = (project: GQLProject): Project => ({
  id: project.id,
  name: project.name,
  description: project.description,
  scope: project.publication?.scope ?? "PRIVATE",
  alias: project.alias,
  assetPublic: project.publication?.assetPublic ?? false,
  requestRoles: project.requestRoles ?? [],
  token: project.publication?.token ?? "",
});
