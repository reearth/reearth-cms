import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { PublicScope, Model } from "@reearth-cms/components/molecules/Accessibility";
import {
  useUpdateModelMutation,
  useGetProjectQuery,
  useGetModelsQuery,
  Model as GQLModel,
  ProjectPublicationScope,
  useUpdateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { fromGraphQLModel } from "@reearth-cms/utils/values";

export default ({ projectId }: { projectId?: string }) => {
  const t = useT();

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
      projectData?.node?.__typename === "Project"
        ? convertScope(projectData.node.publication?.scope)
        : undefined,
    [projectData],
  );

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [updateModelMutation] = useUpdateModelMutation();

  const handleAccessibilityUpdate = useCallback(
    async (scope?: PublicScope, modelsToUpdate?: Model[]) => {
      if (!projectId) return;
      let errors = false;

      if (scope && scope !== projectScope) {
        const gqlScope =
          scope === "public" ? ProjectPublicationScope.Public : ProjectPublicationScope.Private;
        const projRes = await updateProjectMutation({
          variables: { projectId, publication: { scope: gqlScope } },
        });
        if (projRes.errors) {
          errors = true;
        }
      }

      if (modelsToUpdate) {
        modelsToUpdate.forEach(async model => {
          const modelRes = await updateModelMutation({
            variables: { modelId: model.id, public: model.public },
          });
          if (modelRes.errors) {
            errors = true;
          }
        });
      }
      if (errors) {
        Notification.error({ message: t("Failed to update accessiblity options.") });
      } else {
        Notification.success({
          message: t("Successfully updated accessibility options!"),
        });
      }
    },
    [projectId, projectScope, t, updateProjectMutation, updateModelMutation],
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
