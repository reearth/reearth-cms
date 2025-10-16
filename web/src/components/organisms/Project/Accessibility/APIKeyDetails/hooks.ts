import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { Model as GQLModel } from "@reearth-cms/gql/__generated__/graphql.generated";
import { GetModelsDocument } from "@reearth-cms/gql/__generated__/model.generated";
import {
  CreateApiKeyDocument,
  RegenerateApiKeyDocument,
  UpdateApiKeyDocument,
} from "@reearth-cms/gql/__generated__/project.generated";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights, useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { workspaceId, projectId, keyId } = useParams();
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.apiKey.create, [userRights?.apiKey.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.apiKey.update, [userRights?.apiKey.update]);
  const hasPublishRight = useMemo(
    () => !!userRights?.project.publish,
    [userRights?.project.publish],
  );
  const isNewKey = useMemo(() => keyId === "new", [keyId]);

  const [createAPIKeyMutation, { loading: createLoading }] = useMutation(CreateApiKeyDocument, {
    refetchQueries: ["GetProject"],
  });
  const [updateAPIKeyMutation, { loading: updateLoading }] = useMutation(UpdateApiKeyDocument, {
    refetchQueries: ["GetProject"],
  });
  const [regenerateAPIKeyMutation, { loading: regenerateLoading }] = useMutation(
    RegenerateApiKeyDocument,
    {
      refetchQueries: ["GetProject"],
    },
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

  const currentKey = useMemo(
    () => currentProject?.accessibility?.apiKeys?.find(key => key.id === keyId),
    [currentProject?.accessibility?.apiKeys, keyId],
  );

  const initialValues = useMemo(() => {
    const publicModelSet = new Set(
      isNewKey
        ? (currentProject?.accessibility?.publication?.publicModels ?? [])
        : (currentKey?.publication?.publicModels ?? []),
    );

    return {
      name: currentKey?.name ?? "",
      description: currentKey?.description ?? "",
      key: currentKey?.key ?? "",
      assetPublic: currentKey?.publication.publicAssets ?? false,
      models: models.reduce<Record<string, boolean>>((acc, model) => {
        acc[model.id] = publicModelSet.has(model.id);
        return acc;
      }, {}),
    };
  }, [
    isNewKey,
    currentKey?.name,
    currentKey?.description,
    currentKey?.key,
    currentKey?.publication?.publicAssets,
    currentKey?.publication?.publicModels,
    currentProject?.accessibility?.publication?.publicModels,
    models,
  ]);

  const handleAPIKeyCreate = useCallback(
    async (
      name: string,
      description: string,
      publication: { publicModels: string[]; publicAssets: boolean },
    ) => {
      if (!currentProject?.id) return;
      const result = await createAPIKeyMutation({
        variables: {
          projectId: currentProject.id,
          name,
          description,
          publication,
        },
      });
      if (result.error || !result.data?.createAPIKey) {
        Notification.error({ message: t("Failed to create API Key.") });
        return;
      }
      Notification.success({ message: t("API Key created successfully.") });
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/accessibility/${result.data?.createAPIKey?.apiKey.id}`,
      );
    },
    [createAPIKeyMutation, currentProject?.id, navigate, projectId, t, workspaceId],
  );

  const handleAPIKeyUpdate = useCallback(
    async (
      id: string,
      name: string,
      description: string,
      publication: { publicModels: string[]; publicAssets: boolean },
    ) => {
      if (!currentProject?.id) return;
      const result = await updateAPIKeyMutation({
        variables: {
          id,
          projectId: currentProject.id,
          name,
          description,
          publication,
        },
      });
      if (result.error || !result.data?.updateAPIKey) {
        Notification.error({ message: t("Failed to update API Key.") });
        return;
      }
      Notification.success({ message: t("API Key updated successfully.") });
    },
    [updateAPIKeyMutation, currentProject?.id, t],
  );

  const handleAPIKeyRegenerate = useCallback(
    async (id?: string) => {
      if (!currentProject?.id || !id) return;
      const result = await regenerateAPIKeyMutation({
        variables: {
          projectId: currentProject.id,
          id,
        },
      });
      if (result.error || !result.data?.regenerateAPIKey) {
        Notification.error({ message: t("Failed to re-generate API Key.") });
        return;
      }
      Notification.success({ message: t("API Key re-generated successfully.") });
    },
    [currentProject?.id, regenerateAPIKeyMutation, t],
  );

  const apiUrl = useMemo(
    () => `${window.REEARTH_CONFIG?.api}/p/${currentWorkspace?.alias}/${currentProject?.alias}/`,
    [currentProject?.alias, currentWorkspace?.alias],
  );

  const handleBack = useCallback(() => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/accessibility`, {
      state: location.state,
    });
  }, [location.state, navigate, projectId, workspaceId]);

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    topRef.current?.scrollIntoView();
  }, []);

  return {
    apiUrl,
    keyId,
    currentProject,
    currentKey,
    createLoading,
    hasPublishRight,
    hasCreateRight,
    hasUpdateRight,
    initialValues,
    isNewKey,
    keyModels: models,
    updateLoading,
    regenerateLoading,
    topRef,
    handleAPIKeyCreate,
    handleAPIKeyUpdate,
    handleAPIKeyRegenerate,
    handleBack,
  };
};
