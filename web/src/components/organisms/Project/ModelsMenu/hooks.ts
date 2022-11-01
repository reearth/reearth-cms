import { useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Schema/types";
import {
  useGetModelsQuery,
  useCreateModelMutation,
  useCheckModelKeyAvailabilityLazyQuery,
  Model as GQLModel,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useModel } from "@reearth-cms/state";
import { fromGraphQLModel } from "@reearth-cms/utils/values";

type Params = {
  projectId?: string;
  modelId?: string;
};

export default ({ projectId, modelId }: Params) => {
  const t = useT();
  const [currentModel, setCurrentModel] = useModel();

  const [modelModalShown, setModelModalShown] = useState(false);
  const [isKeyAvailable, setIsKeyAvailable] = useState(false);

  const [CheckModelKeyAvailability, { data: keyData }] = useCheckModelKeyAvailabilityLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleModelKeyCheck = useCallback(
    async (projectId: string, key: string) => {
      if (!projectId || !key) return false;
      const response = await CheckModelKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkModelKeyAvailability.available : false;
    },
    [CheckModelKeyAvailability],
  );

  useEffect(() => {
    setIsKeyAvailable(!!keyData?.checkModelKeyAvailability.available);
  }, [keyData?.checkModelKeyAvailability]);

  const { data } = useGetModelsQuery({
    variables: { projectId: projectId ?? "", first: 100 },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return data?.models.nodes
      ?.map<Model | undefined>(model => (model ? fromGraphQLModel(model as GQLModel) : undefined))
      .filter((model): model is Model => !!model);
  }, [data?.models.nodes]);

  const rawModel = useMemo(
    () => data?.models.nodes?.find(node => node?.id === modelId),
    [data, modelId],
  );

  const model = useMemo<Model | undefined>(
    () => (rawModel?.id ? fromGraphQLModel(rawModel as GQLModel) : undefined),
    [rawModel],
  );

  useEffect(() => {
    if (model?.id === currentModel?.id) return;
    setCurrentModel(model ?? currentModel);
  }, [model, currentModel, setCurrentModel]);

  const [createNewModel] = useCreateModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handleModelCreate = useCallback(
    async (data: { name: string; description: string; key: string }) => {
      if (!projectId) return;
      const model = await createNewModel({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (model.errors || !model.data?.createModel) {
        Notification.error({ message: t("Failed to create model.") });
        return;
      }
      Notification.success({ message: t("Successfully created model!") });
      setModelModalShown(false);
    },
    [createNewModel, projectId, t],
  );

  const handleModalClose = useCallback(() => setModelModalShown(false), []);

  const handleModalOpen = useCallback(() => setModelModalShown(true), []);

  return {
    model,
    models,
    modelModalShown,
    isKeyAvailable,
    handleModalOpen,
    handleModalClose,
    handleModelCreate,
    handleModelKeyCheck,
  };
};
