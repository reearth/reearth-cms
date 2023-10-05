import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import { Field, FieldType, Model, Group } from "@reearth-cms/components/molecules/Schema/types";
import {
  useCreateFieldMutation,
  SchemaFieldType,
  SchemaFieldTypePropertyInput,
  useDeleteFieldMutation,
  useUpdateFieldMutation,
  useUpdateFieldsMutation,
  useGetModelsQuery,
  useGetGroupsQuery,
  Model as GQLModel,
  Group as GQLGroup,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useModel } from "@reearth-cms/state";
import { fromGraphQLModel, fromGraphQLGroup } from "@reearth-cms/utils/values";

export default () => {
  const t = useT();
  const { confirm } = Modal;
  const navigate = useNavigate();
  const { projectId, workspaceId, modelId } = useParams();
  const [currentModel] = useModel();

  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [fieldCreationModalShown, setFieldCreationModalShown] = useState(false);
  const [isMeta, setIsMeta] = useState<boolean | undefined>(false);
  const [fieldUpdateModalShown, setFieldUpdateModalShown] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const [collapsed, collapse] = useState(false);
  const [selectedSchemaType, setSelectedSchemaType] = useState<SelectedSchemaType>("model");
  const { data: modelsData } = useGetModelsQuery({
    variables: {
      projectId: projectId ?? "",
      pagination: { first: 100 },
    },
    skip: !projectId,
  });

  const models = useMemo(() => {
    return modelsData?.models.nodes
      ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
      .filter((model): model is Model => !!model);
  }, [modelsData?.models.nodes]);

  const { data: groupsData } = useGetGroupsQuery({
    variables: {
      projectId: projectId ?? "",
    },
    skip: !projectId,
  });

  const groups = useMemo(() => {
    return groupsData?.groups
      ?.map<Group | undefined>(group => fromGraphQLGroup(group as GQLGroup))
      .filter((group): group is Group => !!group);
  }, [groupsData?.groups]);

  const rawGroup = useMemo(
    () => groupsData?.groups?.find(node => node?.id === groupId),
    [groupsData?.groups, groupId],
  );

  const group = useMemo<Group | undefined>(
    () => (rawGroup?.id ? fromGraphQLGroup(rawGroup as GQLGroup) : undefined),
    [rawGroup],
  );

  useEffect(() => {
    if (!modelId && currentModel) {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${currentModel.id}`);
    }
  }, [modelId, currentModel, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModelSelect = useCallback(
    (modelId: string) => {
      setSelectedSchemaType("model");
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const handleGroupSelect = useCallback((groupId: string) => {
    setSelectedSchemaType("group");
    setGroupId(groupId);
  }, []);

  const handleFieldKeyUnique = useCallback(
    (key: string, fieldId?: string): boolean => {
      return !currentModel?.schema.fields.some(
        field => field.key === key && (!fieldId || (fieldId && fieldId !== field.id)),
      );
    },
    [currentModel],
  );

  const [createNewField, { loading: fieldCreationLoading }] = useCreateFieldMutation({
    refetchQueries: ["GetModels"],
  });

  const [updateField, { loading: fieldUpdateLoading }] = useUpdateFieldMutation({
    refetchQueries: ["GetModels"],
  });

  const [deleteFieldMutation] = useDeleteFieldMutation({
    refetchQueries: ["GetModels"],
  });

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!modelId) return;
      const results = await deleteFieldMutation({
        variables: { modelId, fieldId, metadata: isMeta },
      });
      if (results.errors) {
        Notification.error({ message: t("Failed to delete field.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted field!") });
    },
    [modelId, deleteFieldMutation, isMeta, t],
  );

  const handleFieldUpdate = useCallback(
    async (data: {
      fieldId?: string;
      groupId?: string;
      title: string;
      description?: string;
      key: string;
      metadata?: boolean;
      multiple: boolean;
      unique: boolean;
      isTitle: boolean;
      required: boolean;
      type?: FieldType;
      typeProperty: SchemaFieldTypePropertyInput;
    }) => {
      if ((!modelId && !groupId) || !data.fieldId) return;
      const field = await updateField({
        variables: {
          modelId,
          groupId,
          fieldId: data.fieldId,
          title: data.title,
          metadata: data.metadata,
          description: data.description,
          key: data.key,
          multiple: data.multiple,
          unique: data.unique,
          isTitle: data.isTitle,
          required: data.required,
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
    [modelId, groupId, updateField, t],
  );

  const [updateFieldsOrder] = useUpdateFieldsMutation({
    refetchQueries: ["GetModels"],
  });

  const handleFieldOrder = useCallback(
    async (fields: Field[]) => {
      if (!modelId) return;
      const response = await updateFieldsOrder({
        variables: {
          updateFieldInput: fields.map((field, index) => ({
            modelId,
            fieldId: field.id,
            metadata: field.metadata,
            order: index,
          })),
        },
      });
      if (response.errors || !response?.data?.updateFields) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldUpdateModalShown(false);
    },
    [modelId, updateFieldsOrder, t],
  );

  const handleFieldCreate = useCallback(
    async (data: {
      groupId?: string;
      title: string;
      description?: string;
      key: string;
      metadata?: boolean;
      multiple: boolean;
      unique: boolean;
      isTitle: boolean;
      required: boolean;
      type?: FieldType;
      typeProperty: SchemaFieldTypePropertyInput;
    }) => {
      if (!modelId && !groupId) return;
      const field = await createNewField({
        variables: {
          modelId,
          groupId,
          title: data.title,
          metadata: data.metadata,
          description: data.description,
          key: data.key,
          multiple: data.multiple,
          unique: data.unique,
          isTitle: data.isTitle,
          required: data.required,
          type: data.type as SchemaFieldType,
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
    [modelId, groupId, createNewField, t],
  );

  const handleFieldCreationModalOpen = useCallback(
    (fieldType: FieldType) => {
      if (fieldType === "Group" && groups?.length === 0) {
        confirm({
          title: "No available Group",
          content: "Please create a Group first to use the field",
          okText: "Create Group",
          okType: "primary",
          cancelText: "Cancel",
          onOk() {
            console.log("OK");
          },
          onCancel() {
            console.log("Cancel");
          },
        });
      } else {
        setSelectedType(fieldType);
        if (modelId) setFieldCreationModalShown(true);
      }
    },
    [confirm, groups, modelId],
  );

  const handleFieldUpdateModalClose = useCallback(() => {
    setSelectedField(null);
    setFieldUpdateModalShown(false);
  }, [setSelectedField]);

  const handleFieldCreationModalClose = useCallback(() => {
    setFieldCreationModalShown(false);
    handleFieldUpdateModalClose();
  }, [handleFieldUpdateModalClose]);

  const handleFieldUpdateModalOpen = useCallback(
    (field: Field) => {
      setSelectedType(field.type);
      setSelectedField(field);
      setFieldUpdateModalShown(true);
    },
    [setSelectedField],
  );

  return {
    models,
    groups,
    groupId,
    group,
    isMeta,
    setIsMeta,
    fieldCreationModalShown,
    fieldUpdateModalShown,
    selectedField,
    currentModel,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    collapse,
    selectedSchemaType,
    handleModelSelect,
    handleGroupSelect,
    handleFieldCreationModalClose,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldUpdateModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
  };
};
