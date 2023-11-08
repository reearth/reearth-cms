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

  const rawModel = useMemo(
    () => modelsData?.models?.nodes?.find(node => node?.id === modelId),
    [modelsData?.models, modelId],
  );

  const model = useMemo<Model | undefined>(
    () => (rawModel?.id ? fromGraphQLModel(rawModel as GQLModel) : undefined),
    [rawModel],
  );

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
        variables: { fieldId, metadata: isMeta } as any,
      };
      selectedSchemaType === "model"
        ? (options.variables.modelId = modelId)
        : (options.variables.groupId = groupId);
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
          typeProperty: data.typeProperty,
        },
      } as any;
      selectedSchemaType === "model"
        ? (options.variables.modelId = modelId)
        : (options.variables.groupId = groupId);
      const field = await updateField(options);
      if (field.errors || !field.data?.updateField) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldUpdateModalShown(false);
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
          updateFieldInput: fields.map((field, index) => {
            const options = {
              fieldId: field.id,
              metadata: field.metadata,
              order: index,
            } as any;
            selectedSchemaType === "model"
              ? (options.modelId = modelId)
              : (options.groupId = groupId);
            return options;
          }),
        },
      });
      if (response.errors || !response?.data?.updateFields) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldUpdateModalShown(false);
    },
    [modelId, groupId, updateFieldsOrder, t, selectedSchemaType],
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
          typeProperty: data.typeProperty,
        } as any,
      };
      selectedSchemaType === "model"
        ? (options.variables.modelId = modelId)
        : (options.variables.groupId = groupId);
      const field = await createNewField(options);
      if (field.errors || !field.data?.createField) {
        Notification.error({ message: t("Failed to create field.") });
        setFieldCreationModalShown(false);
        return;
      }
      Notification.success({ message: t("Successfully created field!") });
      setFieldCreationModalShown(false);
    },
    [modelId, groupId, selectedSchemaType, createNewField, t],
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

  // group hooks
  const [groupCreateModalShown, setGroupCreateModalShown] = useState(false);
  const [groupUpdateModalShown, setGroupUpdateModalShown] = useState(false);
  const [isGroupKeyAvailable, setIsGroupKeyAvailable] = useState(false);
  const [groupDeletionModalShown, setGroupDeletionModalShown] = useState(false);

  const handleGroupCreateModalClose = useCallback(() => setGroupCreateModalShown(false), []);
  const handleGroupUpdateModalClose = useCallback(() => setGroupUpdateModalShown(false), []);
  const handleGroupCreateModalOpen = useCallback(() => setGroupCreateModalShown(true), []);
  const handleGroupUpdateModalOpen = useCallback(() => setGroupUpdateModalShown(true), []);
  const handleGroupDeletionModalOpen = useCallback(
    () => setGroupDeletionModalShown(true),
    [setGroupDeletionModalShown],
  );
  const handleGroupDeletionModalClose = useCallback(
    () => setGroupDeletionModalShown(false),
    [setGroupDeletionModalShown],
  );
  const [CheckGroupKeyAvailability, { data: groupKeyData }] = useCheckGroupKeyAvailabilityLazyQuery(
    {
      fetchPolicy: "no-cache",
    },
  );

  const handleGroupKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      const response = await CheckGroupKeyAvailability({ variables: { projectId, key } });
      return response.data ? response.data.checkGroupKeyAvailability.available : false;
    },
    [projectId, CheckGroupKeyAvailability],
  );

  useEffect(() => {
    setIsGroupKeyAvailable(!!groupKeyData?.checkGroupKeyAvailability.available);
  }, [groupKeyData?.checkGroupKeyAvailability]);

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
    async (data: { name: string; description: string; key: string }) => {
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
      handleGroupCreateModalClose();
    },
    [projectId, createNewGroup, t, handleGroupCreateModalClose],
  );

  const [updateNewGroup] = useUpdateGroupMutation({
    refetchQueries: ["GetGroups"],
  });

  const handleGroupUpdate = useCallback(
    async (data: { groupId?: string; name: string; description: string; key: string }) => {
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
      handleGroupUpdateModalClose();
    },
    [updateNewGroup, handleGroupUpdateModalClose, t],
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
            handleGroupCreateModalOpen();
          },
          onCancel() {
            handleGroupCreateModalClose();
          },
        });
      } else {
        setSelectedType(fieldType);
        if (modelId) setFieldCreationModalShown(true);
      }
    },
    [confirm, groups?.length, handleGroupCreateModalClose, handleGroupCreateModalOpen, modelId, t],
  );

  // model hooks
  const [modelUpdateModalShown, setModelUpdateModalShown] = useState(false);
  const [isModelKeyAvailable, setIsModelKeyAvailable] = useState(false);
  const [modelDeletionModalShown, setModelDeletionModalShown] = useState(false);

  const [CheckModelKeyAvailability, { data: keyData }] = useCheckModelKeyAvailabilityLazyQuery({
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

  useEffect(() => {
    setIsModelKeyAvailable(!!keyData?.checkModelKeyAvailability.available);
  }, [keyData?.checkModelKeyAvailability]);

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

  const handleModelUpdateModalClose = useCallback(() => setModelUpdateModalShown(false), []);
  const handleModelUpdateModalOpen = useCallback(() => setModelUpdateModalShown(true), []);

  const handleModelUpdate = useCallback(
    async (data: { modelId?: string; name: string; description: string; key: string }) => {
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
      handleModelUpdateModalClose();
    },
    [updateNewModel, handleModelUpdateModalClose, t],
  );

  return {
    models,
    model,
    groups,
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
    // group
    groupCreateModalShown,
    groupUpdateModalShown,
    isGroupKeyAvailable,
    groupDeletionModalShown,
    handleGroupUpdateModalOpen,
    handleGroupDeletionModalOpen,
    handleGroupCreateModalClose,
    handleGroupUpdateModalClose,
    handleGroupDeletionModalClose,
    handleGroupDelete,
    handleGroupCreate,
    handleGroupUpdate,
    handleGroupKeyCheck,
    // modal
    modelUpdateModalShown,
    isModelKeyAvailable,
    modelDeletionModalShown,
    handleModelUpdateModalOpen,
    handleModelDeletionModalOpen,
    handleModelUpdateModalClose,
    handleModelDeletionModalClose,
    handleModelDelete,
    handleModelUpdate,
    handleModelKeyCheck,
  };
};
