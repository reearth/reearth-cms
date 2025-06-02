import { useCallback, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { FormType, ProjectVisibility } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  usePublishModelsMutation,
  useGetModelsQuery,
  useUpdateProjectMutation,
  useDeleteApiKeyMutation,
  Model as GQLModel,
  ProjectVisibility as GQLProjectVisibility,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const { workspaceId, projectId } = useParams();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();
  const hasPublishRight = useMemo(
    () => !!userRights?.project.publish,
    [userRights?.project.publish],
  );
  const [updateLoading, setUpdateLoading] = useState(false);

  const { data: modelsData } = useGetModelsQuery({
    variables: {
      projectId: currentProject?.id ?? "",
      pagination: { first: 100 },
    },
    skip: !currentProject?.id,
  });

  const models = useMemo(
    () =>
      modelsData?.models.nodes
        ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
        .filter((model): model is Model => !!model) ?? [],
    [modelsData?.models.nodes],
  );

  const alias = useMemo(() => currentProject?.alias ?? "", [currentProject?.alias]);

  const initialValues = useMemo(() => {
    const modelsObj: Record<string, boolean> = {};
    models?.forEach(model => {
      modelsObj[model.id] = !!model.public;
    });

    const visibility = currentProject?.accessibility?.visibility ?? "PRIVATE";
    const publication = currentProject?.accessibility?.publication;

    return {
      scope: visibility,
      alias,
      token: "",
      assetPublic: publication?.publicAssets ?? false,
      models: modelsObj,
    };
  }, [
    alias,
    currentProject?.accessibility?.visibility,
    currentProject?.accessibility?.publication,
    models,
  ]);

  const scopeConvert = useCallback(
    (scope?: ProjectVisibility) =>
      scope === "PUBLIC" ? GQLProjectVisibility.Public : GQLProjectVisibility.Private,
    [],
  );

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [publishModelsMutation] = usePublishModelsMutation({
    refetchQueries: ["GetModels"],
  });

  const [deleteAPIKeyMutation] = useDeleteApiKeyMutation({ refetchQueries: ["GetProject"] });

  const handlePublicUpdate = useCallback(
    async ({ scope, assetPublic }: FormType, models: { modelId: string; status: boolean }[]) => {
      if (!currentProject?.id) return;
      setUpdateLoading(true);
      try {
        const accessibilityChanged =
          initialValues.scope !== scope || initialValues.assetPublic !== assetPublic;

        if (accessibilityChanged) {
          const projRes = await updateProjectMutation({
            variables: {
              projectId: currentProject.id,
              accessibility: {
                visibility: scopeConvert(scope),
                publication: {
                  publicModels: models.map(m => m.modelId),
                  publicAssets: assetPublic,
                },
              },
            },
          });
          if (projRes.errors) throw new Error();
        }

        if (models.length) {
          const res = await publishModelsMutation({ variables: { models } });
          if (res.errors) throw new Error();
        }

        Notification.success({ message: t("Successfully updated publication settings!") });
      } catch (e) {
        Notification.error({ message: t("Failed to update publication settings.") });
        throw e;
      } finally {
        setUpdateLoading(false);
      }
    },
    [
      currentProject?.id,
      initialValues.scope,
      initialValues.assetPublic,
      publishModelsMutation,
      scopeConvert,
      t,
      updateProjectMutation,
    ],
  );

  const handleAPIKeyDelete = useCallback(
    async (id: string) => {
      if (!currentProject?.id) return;
      try {
        await deleteAPIKeyMutation({
          variables: {
            projectId: currentProject.id,
            id,
          },
        });
        Notification.success({ message: t("API Key deleted successfully.") });
      } catch {
        Notification.error({ message: t("Failed to delete API Key.") });
      }
    },
    [deleteAPIKeyMutation, currentProject?.id, t],
  );

  const apiUrl = useMemo(
    () => `${window.REEARTH_CONFIG?.api}/p/${currentProject?.alias}/`,
    [currentProject?.alias],
  );

  const handleSettingsPageOpen = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/settings`);
  };

  const handleAPIKeyEdit = (keyId: string) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/accessibility/${keyId}`);
  };

  return {
    initialValues,
    models,
    hasPublishRight,
    updateLoading,
    apiUrl,
    alias,
    handlePublicUpdate,
    handleAPIKeyDelete,
    handleAPIKeyEdit,
    handleSettingsPageOpen,
  };
};
