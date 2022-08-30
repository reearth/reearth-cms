import { useCallback, useMemo, useState } from "react";

import { Model } from "@reearth-cms/components/molecules/Schema/types";
import {
  useGetModelsQuery,
  useCreateModelMutation,
  useCreateFieldMutation,
  SchemaFiledType,
  SchemaFieldTypePropertyInput,
} from "@reearth-cms/gql/graphql-client-api";

type Params = {
  projectId?: string;
  modelId?: string;
};

export default ({ projectId, modelId }: Params) => {
  const [modelModalShown, setModelModalShown] = useState(false);
  const [fieldModalShown, setFieldModalShown] = useState(false);

  const { data } = useGetModelsQuery({
    variables: { projectId: projectId ?? "" },
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

  const [createNewField] = useCreateFieldMutation({
    refetchQueries: ["GetModels"],
  });

  const handleFieldCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      key: string;
      multiValue: boolean;
      unique: boolean;
      required: boolean;
      type: SchemaFiledType;
      typeProperty: SchemaFieldTypePropertyInput;
    }) => {
      if (!modelId) return;
      const field = await createNewField({
        variables: {
          modelId,
          title: data.title,
          description: data.description,
          key: data.key,
          multiValue: data.multiValue,
          unique: data.unique,
          required: data.required,
          type: data.type,
          typeProperty: data.typeProperty,
        },
      });
      if (field.errors || !field.data?.createField) {
        // Show error message
        setModelModalShown(false);
        return;
      }

      setModelModalShown(false);
    },
    [createNewModel, projectId, modelId],
  );

  const handleModelModalClose = useCallback(() => {
    setModelModalShown(false);
  }, []);

  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  const handleFieldModalClose = useCallback(() => setFieldModalShown(false), []);

  const handleFieldModalOpen = useCallback(() => {
    if (modelId) setFieldModalShown(true);
  }, [modelId]);

  return {
    model,
    models,
    modelModalShown,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelCreate,
    fieldModalShown,
    handleFieldModalOpen,
    handleFieldModalClose,
    handleFieldCreate,
  };
};
