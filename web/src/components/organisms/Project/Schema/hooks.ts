import { useCallback, useEffect, useMemo, useState } from "react";

import { Field, FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";
import {
  useGetModelsQuery,
  useCreateModelMutation,
  useCreateFieldMutation,
  SchemaFiledType,
  SchemaFieldTypePropertyInput,
  useCheckModelKeyAvailabilityLazyQuery,
  useDeleteFieldMutation,
  useUpdateFieldMutation,
} from "@reearth-cms/gql/graphql-client-api";

type Params = {
  projectId?: string;
  modelId?: string;
};

export default ({ projectId, modelId }: Params) => {
  const [modelModalShown, setModelModalShown] = useState(false);
  const [fieldCreationModalShown, setFieldCreationModalShown] = useState(false);
  const [fieldUpdateModalShown, setFieldUpdateModalShown] = useState(false);
  const [isKeyAvailable, setIsKeyAvailable] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>();
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const [CheckModelKeyAvailability, { data: keyData }] = useCheckModelKeyAvailabilityLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleModelKeyCheck = useCallback(
    async (projectId: string, key: string) => {
      if (!projectId || !key) return false;
      const response = await CheckModelKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkModelKeyAvailability.available : false;
    },
    [projectId, CheckModelKeyAvailability],
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
                key: field.key,
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

  const [updateField] = useUpdateFieldMutation({
    refetchQueries: ["GetModels"],
  });

  const [deleteFieldMutation] = useDeleteFieldMutation({
    refetchQueries: ["GetModels"],
  });

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!modelId) return;
      const results = await deleteFieldMutation({ variables: { modelId, fieldId } });
      if (results.errors) {
        console.log("errors");
      }
    },
    [modelId, deleteFieldMutation],
  );

  const handleFieldUpdate = useCallback(
    async (data: {
      fieldId: string;
      title: string;
      description: string;
      key: string;
      typeProperty: SchemaFieldTypePropertyInput;
    }) => {
      if (!modelId) return;
      const field = await updateField({
        variables: {
          modelId,
          fieldId: data.fieldId,
          title: data.title,
          description: data.description,
          key: data.key,
          typeProperty: data.typeProperty,
        },
      });
      if (field.errors || !field.data?.updateField) {
        // Show error message
        setModelModalShown(false);
        return;
      }

      setModelModalShown(false);
    },
    [createNewModel, projectId, modelId],
  );

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

  const handleModelModalClose = useCallback(() => setModelModalShown(false), []);

  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  const handleFieldCreationModalClose = useCallback(() => setFieldCreationModalShown(false), []);

  const handleFieldCreationModalOpen = useCallback(
    (fieldType: FieldType) => {
      setSelectedType(fieldType);
      if (modelId) setFieldCreationModalShown(true);
    },
    [modelId],
  );

  const handleFieldUpdateModalClose = useCallback(() => {
    setSelectedField(null);
    setFieldUpdateModalShown(false);
  }, [setSelectedField]);

  const handleFieldUpdateModalOpen = useCallback(
    (field: Field) => {
      setSelectedType(field.type);
      setSelectedField(field);
      setFieldUpdateModalShown(true);
    },
    [setSelectedField],
  );

  return {
    model,
    models,
    modelModalShown,
    handleModelModalOpen,
    handleModelModalClose,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleModelCreate,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    handleFieldCreationModalOpen,
    handleFieldCreationModalClose,
    selectedField,
    handleFieldCreate,
    handleFieldUpdate,
    handleFieldDelete,
    handleModelKeyCheck,
    isKeyAvailable,
    selectedType,
  };
};
