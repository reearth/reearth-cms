import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Field, FieldType, Model } from "@reearth-cms/components/molecules/Schema/types";
import {
  useGetModelsQuery,
  useCreateFieldMutation,
  SchemaFiledType,
  SchemaFieldTypePropertyInput,
  useDeleteFieldMutation,
  useUpdateFieldMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Params = {
  projectId?: string;
  modelId?: string;
};

export default ({ projectId, modelId }: Params) => {
  const [fieldCreationModalShown, setFieldCreationModalShown] = useState(false);
  const [fieldUpdateModalShown, setFieldUpdateModalShown] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const t = useT();

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
                typeProperty: field.typeProperty,
              })),
            },
          }
        : undefined,
    [rawModel],
  );

  const handleFieldKeyUnique = useCallback(
    (key: string, fieldId?: string): boolean => {
      return !model?.schema.fields.some(
        field => field.key === key && (!fieldId || (fieldId && fieldId !== field.id)),
      );
    },
    [model?.schema.fields],
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
        Notification.error({ message: t("Failed to delete field.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted field!") });
    },
    [modelId, deleteFieldMutation, t],
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
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldUpdateModalShown(false);
    },
    [modelId, updateField, t],
  );

  const handleFieldCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      key: string;
      multiValue: boolean;
      unique: boolean;
      required: boolean;
      type: FieldType;
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
          type: data.type as SchemaFiledType,
          typeProperty: data.typeProperty,
        },
      });
      if (field.errors || !field.data?.createField) {
        Notification.error({ message: t("Failed to create field.") });
        setFieldCreationModalShown(false);
        return;
      }
      Notification.success({ message: t("Successfully created field!") });
      setFieldCreationModalShown(false);
    },
    [modelId, createNewField, t],
  );

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
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleFieldKeyUnique,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    handleFieldCreationModalOpen,
    handleFieldCreationModalClose,
    selectedField,
    handleFieldCreate,
    handleFieldUpdate,
    handleFieldDelete,
    selectedType,
  };
};
