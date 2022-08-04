import { useCallback, useMemo, useState } from "react";

import { Model } from "@reearth-cms/components/molecules/Dashboard/types";
import { useGetModelsQuery, useCreateModelMutation } from "@reearth-cms/gql/graphql-client-api";

type Params = {
  projectId?: string;
  modelId?: string;
};

export default ({ projectId, modelId }: Params) => {
  const [modelModalShown, setModelModalShown] = useState(false);

  const { data, refetch } = useGetModelsQuery({
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
                  unique: field.unique,
                  required: field.required,
                })),
              },
            }
          : undefined,
      )
      .filter((model): model is Model => !!model);
  }, [data?.models.nodes]);

  const rawModel = useMemo(
    () => data?.models.nodes.find((p: any) => p?.id === modelId),
    [data, modelId],
  );
  const model = useMemo(
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
                unique: field.unique,
                required: field.required,
              })),
            },
          }
        : undefined,
    [rawModel],
  );

  const [createNewModel] = useCreateModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handleProjectCreate = useCallback(
    async (data: { name: string; description: string; key: string }) => {
      if (!projectId) return;
      const project = await createNewModel({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (project.errors || !project.data?.createModel) {
        setModelModalShown(false);
        return;
      }

      setModelModalShown(false);
      refetch();
    },
    [createNewModel, projectId, refetch],
  );
  const handleModelModalClose = useCallback(() => {
    setModelModalShown(false);
  }, []);

  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  return {
    model,
    models,
    modelModalShown,
    handleModelModalOpen,
    handleModelModalClose,
    handleProjectCreate,
  };
};
