import { useCallback, useEffect, useMemo, useState } from "react";

import { Model } from "@reearth-cms/components/molecules/Schema/types";
import {
  useGetModelsQuery,
  useCreateModelMutation,
  useCheckModelKeyAvailabilityLazyQuery,
} from "@reearth-cms/gql/graphql-client-api";

type Params = {
  projectId?: string;
  modelId?: string;
};

export default ({ projectId, modelId }: Params) => {
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
    setIsKeyAvailable(keyData?.checkModelKeyAvailability.available ?? false);
  }, [keyData?.checkModelKeyAvailability]);

  const { data } = useGetModelsQuery({
    variables: { projectId: projectId ?? "", first: 100 },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return (data?.models.nodes ?? [])
      .map<Model | undefined>(model =>
        model
          ? {
              id: model.id,
              description: model.description,
              name: model.name,
              key: model.key,
              schema: {
                id: model.schema.id,
                fields: model.schema.fields.map(field => ({
                  id: field.id,
                  description: field.description,
                  title: field.title,
                  type: field.type,
                  key: field.key,
                  unique: field.unique,
                  required: field.required,
                  typeProperty: field.typeProperty,
                })),
              },
            }
          : undefined,
      )
      .filter((model): model is Model => !!model);
  }, [data?.models.nodes]);

  const rawModel = useMemo(
    () => data?.models.nodes.find(node => node?.id === modelId),
    [data, modelId],
  );

  const model = useMemo<Model | undefined>(
    () =>
      rawModel?.id
        ? {
            id: rawModel.id,
            description: rawModel.description,
            name: rawModel.name,
            key: rawModel.key,
            schema: {
              id: rawModel.schema.id,
              fields: rawModel.schema.fields.map(field => ({
                id: field.id,
                description: field.description,
                title: field.title,
                type: field.type,
                key: field.key,
                unique: field.unique,
                required: field.required,
                typeProperty: field.typeProperty,
              })),
            },
          }
        : undefined,
    [rawModel],
  );

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
        // Show error message
        setModelModalShown(false);
        return;
      }

      setModelModalShown(false);
    },
    [createNewModel, projectId],
  );

  const handleModelModalClose = useCallback(() => setModelModalShown(false), []);

  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  return {
    model,
    models,
    modelModalShown,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelCreate,
    handleModelKeyCheck,
    isKeyAvailable,
  };
};
