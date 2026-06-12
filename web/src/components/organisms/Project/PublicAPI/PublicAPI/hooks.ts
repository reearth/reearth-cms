import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { FormType, PostingFormType } from "@reearth-cms/components/molecules/PublicAPI/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { Model as GQLModel } from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  GetModelsDocument,
  UpdateModelPostingEnabledDocument,
} from "@reearth-cms/gql/__generated__/model.generated";
import {
  DeleteApiKeyDocument,
  UpdateProjectDocument,
} from "@reearth-cms/gql/__generated__/project.generated";
import { useLang, useT } from "@reearth-cms/i18n";
import { useProject, useUserRights } from "@reearth-cms/state";
import { ObjectUtils } from "@reearth-cms/utils/object";

import usePublicApiUrl from "../usePublicApiUrl";

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
  const hasPostingRight = useMemo(
    () => userRights?.role === "OWNER" || userRights?.role === "MAINTAINER",
    [userRights?.role],
  );
  const [updateLoading, setUpdateLoading] = useState(false);

  const isProjectPublic = useMemo(
    () => currentProject?.accessibility?.visibility === "PUBLIC",
    [currentProject?.accessibility?.visibility],
  );

  const apiKeys = useMemo(
    () => currentProject?.accessibility?.apiKeys,
    [currentProject?.accessibility?.apiKeys],
  );

  const { data: modelsData } = useQuery(GetModelsDocument, {
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

  const currentLang = useLang();

  const alias = useMemo(() => currentProject?.alias ?? "", [currentProject?.alias]);

  const initialValues = useMemo(() => {
    const publication = currentProject?.accessibility?.publication;

    return {
      assetPublic: publication?.publicAssets ?? false,
      models: models.reduce<Record<string, boolean>>((acc, model) => {
        acc[model.id] = !!publication?.publicModels?.includes(model.id);
        return acc;
      }, {}),
    };
  }, [currentProject?.accessibility?.publication, models]);

  const savedOrigins = useMemo<string[]>(
    () => currentProject?.accessibility?.posting?.allowedOrigins ?? [],
    [currentProject?.accessibility?.posting?.allowedOrigins],
  );

  const postingInitialValues = useMemo<PostingFormType>(
    () => ({
      models: models.reduce<Record<string, boolean>>((acc, model) => {
        acc[model.id] = !!model.postingEnabled;
        return acc;
      }, {}),
    }),
    [models],
  );

  const [updateProjectMutation] = useMutation(UpdateProjectDocument);

  const [updateModelPostingMutation] = useMutation(UpdateModelPostingEnabledDocument, {
    refetchQueries: ["GetModels"],
  });

  const [deleteAPIKeyMutation] = useMutation(DeleteApiKeyDocument, {
    refetchQueries: ["GetProject"],
  });

  const handlePublicUpdate = useCallback(
    async ({ assetPublic, models }: FormType) => {
      if (!currentProject?.id) return;

      setUpdateLoading(true);

      try {
        const accessibilityChanged =
          initialValues.assetPublic !== assetPublic ||
          !ObjectUtils.shallowEqual(initialValues.models, models);

        if (accessibilityChanged) {
          const publicModels = Object.entries(models)
            .filter(([, isPublic]) => isPublic)
            .map(([modelId]) => modelId);

          const projRes = await updateProjectMutation({
            variables: {
              projectId: currentProject.id,
              accessibility: {
                publication: {
                  publicModels,
                  publicAssets: assetPublic,
                },
              },
            },
          });

          if (projRes.error) throw new Error();
        }
        Notification.success({ message: t("Successfully updated publication settings!") });
      } catch (e) {
        Notification.error({ message: t("Failed to update publication settings.") });
        throw e;
      } finally {
        setUpdateLoading(false);
      }
    },
    [currentProject?.id, initialValues.assetPublic, initialValues.models, t, updateProjectMutation],
  );

  const handlePostingUpdate = useCallback(
    async (origins: string[], changedModels: { modelId: string; status: boolean }[]) => {
      if (!currentProject?.id) return;

      setUpdateLoading(true);

      try {
        // enabled is derived from origins: an empty list means deny-all (disabled).
        const projRes = await updateProjectMutation({
          variables: {
            projectId: currentProject.id,
            accessibility: {
              posting: {
                enabled: origins.length > 0,
                allowedOrigins: origins,
              },
            },
          },
          refetchQueries: ["GetProject"],
        });
        if (projRes.error) throw new Error();

        if (changedModels.length) {
          const modelResults = await Promise.all(
            changedModels.map(({ modelId, status }) =>
              updateModelPostingMutation({ variables: { modelId, enabled: status } }),
            ),
          );
          if (modelResults.some(res => res.error)) throw new Error();
        }

        Notification.success({ message: t("Successfully updated posting settings!") });
      } catch (e) {
        Notification.error({ message: t("Failed to update posting settings.") });
        throw e;
      } finally {
        setUpdateLoading(false);
      }
    },
    [currentProject?.id, t, updateProjectMutation, updateModelPostingMutation],
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

  const apiUrl = usePublicApiUrl({ trailingSlash: true });

  const handleSettingsPageOpen = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/settings`);
  };

  const handleAPIKeyNew = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/publicApi/new`);
  };

  const handleAPIKeyEdit = (keyId?: string) => {
    if (!keyId) return;
    navigate(`/workspace/${workspaceId}/project/${projectId}/publicApi/${keyId}`);
  };

  return {
    apiKeys,
    isProjectPublic,
    initialValues,
    postingInitialValues,
    savedOrigins,
    models,
    hasPublishRight,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    hasPostingRight,
    updateLoading,
    apiUrl,
    alias,
    handleAPIKeyNew,
    handlePublicUpdate,
    handlePostingUpdate,
    handleAPIKeyDelete,
    handleAPIKeyEdit,
    handleSettingsPageOpen,
    currentLang,
  };
};
