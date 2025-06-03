import { useCallback, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { FormType } from "@reearth-cms/components/molecules/Accessibility/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  usePublishModelsMutation,
  useGetModelsQuery,
  useUpdateProjectMutation,
  useDeleteApiKeyMutation,
  Model as GQLModel,
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
  const hasCreateRight = useMemo(() => !!userRights?.apiKey.create, [userRights?.apiKey.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.apiKey.update, [userRights?.apiKey.update]);
  const hasDeleteRight = useMemo(() => !!userRights?.apiKey.delete, [userRights?.apiKey.delete]);
  const [updateLoading, setUpdateLoading] = useState(false);

  const isProjectPublic = useMemo(
    () => currentProject?.accessibility?.publication?.publicAssets ?? false,
    [currentProject?.accessibility?.publication?.publicAssets],
  );

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
    const publication = currentProject?.accessibility?.publication;

    return {
      assetPublic: publication?.publicAssets ?? false,
      models: modelsObj,
    };
  }, [currentProject?.accessibility?.publication, models]);

  const [updateProjectMutation] = useUpdateProjectMutation();
  const [publishModelsMutation] = usePublishModelsMutation({
    refetchQueries: ["GetModels"],
  });

  const [deleteAPIKeyMutation] = useDeleteApiKeyMutation({ refetchQueries: ["GetProject"] });

  const handlePublicUpdate = useCallback(
    async ({ assetPublic }: FormType, models: { modelId: string; status: boolean }[]) => {
      if (!currentProject?.id) return;
      setUpdateLoading(true);
      try {
        const accessibilityChanged = initialValues.assetPublic !== assetPublic;

        if (accessibilityChanged) {
          const projRes = await updateProjectMutation({
            variables: {
              projectId: currentProject.id,
              accessibility: {
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
      initialValues.assetPublic,
      publishModelsMutation,
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

  const handleAPIKeyEdit = (keyId?: string) => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/accessibility/${keyId ?? "new"}`);
  };

  return {
    isProjectPublic,
    initialValues,
    models,
    hasPublishRight,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    updateLoading,
    apiUrl,
    alias,
    handlePublicUpdate,
    handleAPIKeyDelete,
    handleAPIKeyEdit,
    handleSettingsPageOpen,
  };
};
