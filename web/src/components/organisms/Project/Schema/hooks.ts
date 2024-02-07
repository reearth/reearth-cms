import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import { Field, FieldType, Model, Group } from "@reearth-cms/components/molecules/Schema/types";
import type {
  FormValues,
  GroupFormValues,
  ModelFormValues,
} from "@reearth-cms/components/molecules/Schema/types";
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
  useCheckGroupKeyAvailabilityLazyQuery,
  useDeleteGroupMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useCheckModelKeyAvailabilityLazyQuery,
  useModelsByGroupQuery,
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

  const [fieldModalShown, setFieldModalShown] = useState(false);
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [isMeta, setIsMeta] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);
  const [collapsed, setCollapsed] = useState(false);
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
  }, [modelId, currentModel, navigate, workspaceId, projectId]);

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
    refetchQueries: ["GetModels", "GetGroups"],
  });

  const [updateField, { loading: fieldUpdateLoading }] = useUpdateFieldMutation({
    refetchQueries: ["GetModels", "GetGroups"],
  });

  const [deleteFieldMutation] = useDeleteFieldMutation({
    refetchQueries: ["GetModels", "GetGroups"],
  });

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!modelId && !groupId) return;
      const options = {
        variables: {
          fieldId,
          metadata: isMeta,
          modelId: selectedSchemaType === "model" ? modelId : undefined,
          groupId: selectedSchemaType !== "model" ? groupId : undefined,
        },
      };
      const results = await deleteFieldMutation(options);
      if (results.errors) {
        Notification.error({ message: t("Failed to delete field.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted field!") });
    },
    [modelId, groupId, isMeta, selectedSchemaType, deleteFieldMutation, t],
  );

  const handleFieldUpdate = useCallback(
    async (data: FormValues) => {
      if ((!modelId && !groupId) || !data.fieldId) return;
      const options = {
        variables: {
          fieldId: data.fieldId,
          title: data.title,
          metadata: data.metadata,
          description: data.description,
          key: data.key,
          multiple: data.multiple,
          unique: data.unique,
          isTitle: data.isTitle,
          required: data.required,
          typeProperty: data.typeProperty as SchemaFieldTypePropertyInput,
          modelId: selectedSchemaType === "model" ? modelId : undefined,
          groupId: selectedSchemaType !== "model" ? groupId : undefined,
        },
      };
      const field = await updateField(options);
      if (field.errors || !field.data?.updateField) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldModalShown(false);
    },
    [modelId, groupId, selectedSchemaType, updateField, t],
  );

  const [updateFieldsOrder] = useUpdateFieldsMutation({
    refetchQueries: ["GetModels"],
  });

  const handleFieldOrder = useCallback(
    async (fields: Field[]) => {
      if (!modelId && !groupId) return;
      const response = await updateFieldsOrder({
        variables: {
          updateFieldInput: fields.map((field, index) => ({
            fieldId: field.id,
            metadata: field.metadata,
            order: index,
            modelId: selectedSchemaType === "model" ? modelId : undefined,
            groupId: selectedSchemaType !== "model" ? groupId : undefined,
          })),
        },
      });
      if (response.errors || !response?.data?.updateFields) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldModalShown(false);
    },
    [modelId, groupId, updateFieldsOrder, t, selectedSchemaType],
  );

  const handleFieldCreate = useCallback(
    async (data: FormValues) => {
      if (!modelId && !groupId) return;
      const options = {
        variables: {
          title: data.title,
          metadata: data.metadata,
          description: data.description,
          key: data.key,
          multiple: data.multiple,
          unique: data.unique,
          isTitle: data.isTitle,
          required: data.required,
          type: data.type as SchemaFieldType,
          typeProperty: data.typeProperty as SchemaFieldTypePropertyInput,
          modelId: selectedSchemaType === "model" ? modelId : undefined,
          groupId: selectedSchemaType !== "model" ? groupId : undefined,
        },
      };
      const field = await createNewField(options);
      if (field.errors || !field.data?.createField) {
        Notification.error({ message: t("Failed to create field.") });
        setFieldModalShown(false);
        return;
      }
      Notification.success({ message: t("Successfully created field!") });
      setFieldModalShown(false);
    },
    [modelId, groupId, selectedSchemaType, createNewField, t],
  );

  const handleFieldModalClose = useCallback(() => {
    setSelectedField(null);
    setFieldModalShown(false);
  }, [setSelectedField]);

  const handleFieldUpdateModalOpen = useCallback(
    (field: Field) => {
      setSelectedType(field.type);
      setSelectedField(field);
      setFieldModalShown(true);
    },
    [setSelectedField],
  );

  // group hooks
  const [groupModalShown, setGroupModalShown] = useState(false);
  const [groupDeletionModalShown, setGroupDeletionModalShown] = useState(false);

  const handleGroupModalOpen = useCallback(() => setGroupModalShown(true), []);
  const handleGroupModalClose = useCallback(() => setGroupModalShown(false), []);
  const handleGroupDeletionModalOpen = useCallback(
    () => setGroupDeletionModalShown(true),
    [setGroupDeletionModalShown],
  );
  const handleGroupDeletionModalClose = useCallback(
    () => setGroupDeletionModalShown(false),
    [setGroupDeletionModalShown],
  );
  const [CheckGroupKeyAvailability] = useCheckGroupKeyAvailabilityLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleGroupKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      const response = await CheckGroupKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkGroupKeyAvailability.available : false;
    },
    [projectId, CheckGroupKeyAvailability],
  );

  const { data: modelsByGroupData } = useModelsByGroupQuery({
    variables: {
      groupId: groupId ?? "",
    },
    skip: !groupId,
  });

  const [deleteGroup] = useDeleteGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupDelete = useCallback(
    async (groupId?: string) => {
      if (!groupId) return;

      const modelsByGroup = modelsByGroupData?.modelsByGroup || [];
      const isGroupDeletable = modelsByGroup.length === 0;
      if (!isGroupDeletable) {
        handleGroupDeletionModalClose();
        const modelNames = modelsByGroup?.map(model => model?.name).join(", ");
        Modal.error({
          title: t("Group cannot be deleted"),
          content: `
          ${group?.name} ${t("is used in")} ${modelNames}. 
          ${t("If you want to delete it, please delete the field that uses it first.")}`,
        });
        return;
      }

      const res = await deleteGroup({ variables: { groupId } });
      if (res.errors || !res.data?.deleteGroup) {
        Notification.error({ message: t("Failed to delete group.") });
      } else {
        Notification.success({ message: t("Successfully deleted group!") });
        handleGroupDeletionModalClose();
      }
    },
    [deleteGroup, group?.name, handleGroupDeletionModalClose, modelsByGroupData?.modelsByGroup, t],
  );

  const [createNewGroup] = useCreateGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupCreate = useCallback(
    async (data: GroupFormValues) => {
      if (!projectId) return;
      const group = await createNewGroup({
        variables: {
          projectId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (group.errors || !group.data?.createGroup) {
        Notification.error({ message: t("Failed to create group.") });
        return;
      }
      Notification.success({ message: t("Successfully created group!") });
      handleGroupModalClose();
    },
    [projectId, createNewGroup, t, handleGroupModalClose],
  );

  const [updateNewGroup] = useUpdateGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupUpdate = useCallback(
    async (data: GroupFormValues) => {
      if (!data.groupId) return;
      const group = await updateNewGroup({
        variables: {
          groupId: data.groupId,
          name: data.name,
          description: data.description,
          key: data.key,
        },
      });
      if (group.errors || !group.data?.updateGroup) {
        Notification.error({ message: t("Failed to update group.") });
        return;
      }
      Notification.success({ message: t("Successfully updated group!") });
      handleGroupModalClose();
    },
    [updateNewGroup, handleGroupModalClose, t],
  );

  const handleFieldCreationModalOpen = useCallback(
    (fieldType: FieldType) => {
      if (fieldType === "Group" && groups?.length === 0) {
        confirm({
          title: t("No available Group"),
          content: t("Please create a Group first to use the field"),
          okText: "Create Group",
          okType: "primary",
          cancelText: t("Cancel"),
          onOk() {
            handleGroupModalOpen();
          },
          onCancel() {
            handleGroupModalClose();
          },
        });
      } else {
        setSelectedType(fieldType);
        if (modelId) setFieldModalShown(true);
      }
    },
    [confirm, groups?.length, handleGroupModalClose, handleGroupModalOpen, modelId, t],
  );

  // model hooks
  const [modelModalShown, setModelModalShown] = useState(false);
  const [modelDeletionModalShown, setModelDeletionModalShown] = useState(false);

  const [CheckModelKeyAvailability] = useCheckModelKeyAvailabilityLazyQuery({
    fetchPolicy: "no-cache",
  });

  const handleModelKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      const response = await CheckModelKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkModelKeyAvailability.available : false;
    },
    [projectId, CheckModelKeyAvailability],
  );

  const handleModelDeletionModalOpen = useCallback(
    () => setModelDeletionModalShown(true),
    [setModelDeletionModalShown],
  );

  const handleModelDeletionModalClose = useCallback(
    () => setModelDeletionModalShown(false),
    [setModelDeletionModalShown],
  );

  const [deleteModel] = useDeleteModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handleModelDelete = useCallback(
    async (modelId?: string) => {
      if (!modelId) return;
      const res = await deleteModel({ variables: { modelId } });
      if (res.errors || !res.data?.deleteModel) {
        Notification.error({ message: t("Failed to delete model.") });
      } else {
        Notification.success({ message: t("Successfully deleted model!") });
        handleModelDeletionModalClose();
      }
    },
    [deleteModel, handleModelDeletionModalClose, t],
  );

  const [updateNewModel] = useUpdateModelMutation({
    refetchQueries: ["GetModels"],
  });

  const handleModelModalClose = useCallback(() => setModelModalShown(false), []);
  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  const handleModelUpdate = useCallback(
    async (data: ModelFormValues) => {
      if (!data.modelId) return;
      const model = await updateNewModel({
        variables: {
          modelId: data.modelId,
          name: data.name,
          description: data.description,
          key: data.key,
          public: false,
        },
      });
      if (model.errors || !model.data?.updateModel) {
        Notification.error({ message: t("Failed to update model.") });
        return;
      }
      Notification.success({ message: t("Successfully updated model!") });
      handleModelModalClose();
    },
    [updateNewModel, handleModelModalClose, t],
  );

  const isModel = useMemo(() => selectedSchemaType === "model", [selectedSchemaType]);

  return {
    isModel,
    models,
    groups,
    group,
    isMeta,
    setIsMeta,
    fieldModalShown,
    selectedField,
    currentModel,
    selectedType,
    collapsed,
    fieldCreationLoading,
    fieldUpdateLoading,
    setCollapsed,
    selectedSchemaType,
    handleModelSelect,
    handleGroupSelect,
    handleFieldCreationModalOpen,
    handleFieldUpdateModalOpen,
    handleFieldModalClose,
    handleFieldCreate,
    handleFieldKeyUnique,
    handleFieldUpdate,
    handleFieldOrder,
    handleFieldDelete,
    // group
    groupModalShown,
    groupDeletionModalShown,
    handleGroupModalOpen,
    handleGroupDeletionModalOpen,
    handleGroupModalClose,
    handleGroupDeletionModalClose,
    handleGroupDelete,
    handleGroupCreate,
    handleGroupUpdate,
    handleGroupKeyCheck,
    // modal
    modelModalShown,
    modelDeletionModalShown,
    handleModelModalOpen,
    handleModelModalClose,
    handleModelDeletionModalOpen,
    handleModelDeletionModalClose,
    handleModelDelete,
    handleModelUpdate,
    handleModelKeyCheck,
  };
};
