import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  useCreateApiKeyMutation,
  useUpdateApiKeyMutation,
  useRegenerateApiKeyMutation,
  useGetModelsQuery,
  Model as GQLModel,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { keyId } = useParams();
  const [currentProject] = useProject();
  const [userRights] = useUserRights();

  const [createAPIKeyMutation, { loading: createLoading }] = useCreateApiKeyMutation({
    refetchQueries: ["GetProject"],
  });
  const [updateAPIKeyMutation, { loading: updateLoading }] = useUpdateApiKeyMutation({
    refetchQueries: ["GetProject"],
  });
  const [regenerateAPIKeyMutation, { loading: regenerateLoading }] = useRegenerateApiKeyMutation({
    refetchQueries: ["GetProject"],
  });

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

  const mockKey = useMemo(
    () => ({
      id: "01g4eg4ay017hpw58fkh9nd89c",
      name: "Default API Key",
      description: "Default key for public access",
      key: "secret_SuV6vNbzH3WRh2CoOkaCZrGp5mUXCvLPKM36iYjNIoc",
      publication: { publicModels: ["01hth95j5caxs73physevzw15d"], publicAssets: true },
    }),
    [],
  );

  const currentKey = useMemo(() => {
    if (!keyId) return mockKey;
    return currentProject?.accessibility?.apiKeys?.find(key => key.id === keyId) || mockKey;
  }, [currentProject?.accessibility?.apiKeys, keyId, mockKey]);

  const keyModels = useMemo(() => {
    const publicModelIds = currentKey?.publication?.publicModels ?? [];
    return models.filter(model => publicModelIds.includes(model.id));
  }, [currentKey?.publication?.publicModels, models]);

  const initialValues = useMemo(() => {
    const modelsObj: Record<string, boolean> = {};
    models.forEach(modelId => {
      if (currentKey?.publication?.publicModels?.includes(modelId.id)) {
        modelsObj[modelId.id] = true;
      } else {
        modelsObj[modelId.id] = false;
      }
    });
    return {
      name: currentKey.name ?? "",
      description: currentKey.description ?? "",
      key: currentKey.key ?? "",
      assetPublic: currentKey.publication.publicAssets ?? false,
      models: modelsObj,
    };
  }, [
    models,
    currentKey.name,
    currentKey.description,
    currentKey.key,
    currentKey.publication.publicAssets,
    currentKey.publication?.publicModels,
  ]);

  const handleAPIKeyCreate = useCallback(
    async (
      name: string,
      description: string,
      publication: { publicModels: string[]; publicAssets: boolean },
    ) => {
      if (!currentProject?.id) return;
      try {
        await createAPIKeyMutation({
          variables: {
            projectId: currentProject.id,
            name,
            description,
            publication,
          },
        });
        Notification.success({ message: t("API Key created successfully.") });
      } catch {
        Notification.error({ message: t("Failed to create API Key.") });
      }
    },
    [createAPIKeyMutation, currentProject?.id, t],
  );

  const handleAPIKeyUpdate = useCallback(
    async (
      id: string,
      name: string,
      description: string,
      publication: { publicModels: string[]; publicAssets: boolean },
    ) => {
      if (!currentProject?.id) return;
      try {
        await updateAPIKeyMutation({
          variables: {
            id,
            projectId: currentProject.id,
            name,
            description,
            publication,
          },
        });
        Notification.success({ message: t("API Key updated successfully.") });
      } catch {
        Notification.error({ message: t("Failed to update API Key.") });
      }
    },
    [updateAPIKeyMutation, currentProject?.id, t],
  );

  const handleAPIKeyRegenerate = useCallback(
    async (id?: string) => {
      if (!currentProject?.id || !id) return;
      try {
        await regenerateAPIKeyMutation({
          variables: {
            projectId: currentProject.id,
            id,
          },
        });
        Notification.success({ message: t("API Key re-generated successfully.") });
      } catch {
        Notification.error({ message: t("Failed to re-generate API Key.") });
      }
    },
    [regenerateAPIKeyMutation, currentProject?.id, t],
  );
  const hasPublishRight = useMemo(
    () => !!userRights?.project.publish,
    [userRights?.project.publish],
  );

  const apiUrl = useMemo(
    () => `${window.REEARTH_CONFIG?.api}/p/${currentProject?.alias}/`,
    [currentProject?.alias],
  );

  return {
    apiUrl,
    keyId,
    currentProject,
    currentKey,
    createLoading,
    hasPublishRight,
    initialValues,
    keyModels,
    updateLoading,
    regenerateLoading,
    handleAPIKeyCreate,
    handleAPIKeyUpdate,
    handleAPIKeyRegenerate,
  };
};
