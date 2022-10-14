import { useCallback, useMemo } from "react";

import { PublicScope, Model } from "@reearth-cms/components/molecules/Accessibility";
import {
  useUpdateModelMutation,
  useGetProjectQuery,
  useGetModelsQuery,
  Model as GQLModel,
  ProjectPublicationScope,
  // useUpdateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { fromGraphQLModel } from "@reearth-cms/utils/values";

export default ({ projectId }: { projectId?: string }) => {
  const { data: projectData } = useGetProjectQuery({
    variables: { projectId: projectId ?? "" },
    skip: !projectId,
  });

  const { data: modelsData } = useGetModelsQuery({
    variables: {
      projectId: projectId ?? "",
      first: 100,
    },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return modelsData?.models.nodes
      ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
      .filter((model): model is Model => !!model);
  }, [modelsData?.models.nodes]);

  const projectScope = useMemo(
    () =>
      (projectData?.node?.__typename === "Project"
        ? convertScope(projectData.node.publication?.scope)
        : undefined) ?? "private",
    [projectData],
  );

  // const [updateProjectMutation] = useUpdateProjectMutation();
  const [updateModelMutation] = useUpdateModelMutation();

  const handleAccessibilityUpdate = useCallback(
    async (scope: PublicScope, modelsToUpdate?: Model[] | undefined) => {
      if (!projectId) return;
      console.log(scope, "scope");

      // if (scope !== projectScope) {
      //   const gqlScope =
      //     scope === "public" ? ProjectPublicationScope.Public : ProjectPublicationScope.Private;
      //   const projRes = await updateProjectMutation({
      //     variables: { projectId, publication: { scope: gqlScope } },
      //   });
      //   if (projRes.errors) {
      //     //handle errors
      //   } else {
      //     //handle succes notification
      //   }
      // }

      if (modelsToUpdate) {
        modelsToUpdate.forEach(async model => {
          const modelRes = await updateModelMutation({
            variables: { modelId: model.id, public: model.public },
          });
          if (modelRes.errors) {
            //handle error
          } else {
            // handle success notification
          }
        });
      }
    },
    [projectId, updateModelMutation],
    // [projectId, projectScope, updateProjectMutation, updateModelMutation],
  );

  return { projectScope, models, handleAccessibilityUpdate };
};

const convertScope = (scope?: ProjectPublicationScope): PublicScope | undefined => {
  switch (scope) {
    case "PUBLIC":
      return "public";
    case "PRIVATE":
      return "private";
  }
  return undefined;
};
