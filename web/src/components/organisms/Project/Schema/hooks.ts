import { skipToken, useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { FormValues, ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";

import { useModal } from "@reearth-cms/components/atoms/Modal";
import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  CreateFieldInput,
  Field,
  Group,
  MetaDataSchema,
  Schema,
  SchemaFieldType,
  SelectedSchemaType,
} from "@reearth-cms/components/molecules/Schema/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { fromGraphQLGroup } from "@reearth-cms/components/organisms/DataConverters/schema";
import {
  CreateFieldDocument,
  CreateFieldsDocument,
  DeleteFieldDocument,
  UpdateFieldDocument,
  UpdateFieldsDocument,
} from "@reearth-cms/gql/__generated__/field.generated";
import {
  Group as GQLGroup,
  Model as GQLModel,
  SchemaFieldType as GQLSchemaFieldType,
  SchemaFieldTypePropertyInput,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  CheckGroupKeyAvailabilityDocument,
  CreateGroupDocument,
  DeleteGroupDocument,
  GetGroupDocument,
  GetGroupsDocument,
  ModelsByGroupDocument,
  UpdateGroupDocument,
} from "@reearth-cms/gql/__generated__/group.generated";
import {
  CheckModelKeyAvailabilityDocument,
  DeleteModelDocument,
  GetModelDocument,
  GetModelsDocument,
  UpdateModelDocument,
} from "@reearth-cms/gql/__generated__/model.generated";
import { useT } from "@reearth-cms/i18n";
import { useCollapsedModelMenu, useModel, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const { confirm, error } = useModal();
  const navigate = useNavigate();
  const { modelId: schemaId, projectId, workspaceId } = useParams();
  const [currentModel, setCurrentModel] = useModel();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.schema.create, [userRights?.schema.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.schema.update, [userRights?.schema.update]);
  const hasDeleteRight = useMemo(() => !!userRights?.schema.delete, [userRights?.schema.delete]);

  const [modelModalShown, setModelModalShown] = useState(false);
  const [modelDeletionModalShown, setModelDeletionModalShown] = useState(false);
  const [groupModalShown, setGroupModalShown] = useState(false);
  const [groupDeletionModalShown, setGroupDeletionModalShown] = useState(false);
  const [fieldModalShown, setFieldModalShown] = useState(false);
  const [isMeta, setIsMeta] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedType, setSelectedType] = useState<null | SchemaFieldType>(null);
  const [collapsed, setCollapsed] = useCollapsedModelMenu();
  const { data: modelsData } = useQuery(GetModelsDocument, {
    skip: !projectId,
    variables: {
      pagination: { first: 100 },
      projectId: projectId ?? "",
    },
  });

  const models = useMemo(() => {
    return modelsData?.models.nodes
      ?.map<Model | undefined>(model => fromGraphQLModel(model as GQLModel))
      .filter((model): model is Model => !!model);
  }, [modelsData?.models.nodes]);

  const { data: modelData, refetch: modelRefetch } = useQuery(
    GetModelDocument,
    currentModel
      ? { fetchPolicy: "cache-and-network", variables: { id: currentModel.id } }
      : skipToken,
  );

  const handleReferencedModelGet = useCallback(
    (modelId: string) => {
      modelRefetch({ id: modelId });
    },
    [modelRefetch],
  );

  const referencedModel = useMemo<Model | undefined>(
    () => fromGraphQLModel(modelData?.node as GQLModel),
    [modelData?.node],
  );

  const { data: groupsData } = useQuery(GetGroupsDocument, {
    skip: !projectId,
    variables: {
      projectId: projectId ?? "",
    },
  });

  const groups = useMemo(() => {
    return groupsData?.groups
      ?.map<Group | undefined>(group => fromGraphQLGroup(group as GQLGroup))
      .filter((group): group is Group => !!group);
  }, [groupsData?.groups]);

  const { data: groupData } = useQuery(GetGroupDocument, {
    fetchPolicy: "cache-and-network",
    skip: !schemaId,
    variables: {
      id: schemaId ?? "",
    },
  });

  const group = useMemo(() => fromGraphQLGroup(groupData?.node as GQLGroup), [groupData?.node]);

  const selectedSchemaType: SelectedSchemaType = useMemo(
    () => (group ? "group" : "model"),
    [group],
  );

  const isGroup = useMemo(
    () => groupModalShown || selectedSchemaType === "group",
    [groupModalShown, selectedSchemaType],
  );

  const data = useMemo(() => (isGroup ? group : currentModel), [currentModel, group, isGroup]);

  useEffect(() => {
    if (!schemaId && currentModel) {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${currentModel.id}`);
    }
  }, [schemaId, currentModel, navigate, workspaceId, projectId]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );

  const handleGroupSelect = useCallback(
    (groupId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/schema/${groupId}`);
    },
    [navigate, projectId, workspaceId],
  );

  const keyUniqueCheck = useCallback(
    (key: string, fieldId?: string, schema?: MetaDataSchema | Schema) => {
      const sameKeyField = schema?.fields?.find(field => field.key === key);
      return !sameKeyField || sameKeyField.id === fieldId;
    },
    [],
  );

  const handleFieldKeyUnique = useCallback(
    (key: string) =>
      keyUniqueCheck(key, selectedField?.id, isMeta ? currentModel?.metadataSchema : data?.schema),
    [keyUniqueCheck, selectedField?.id, isMeta, currentModel?.metadataSchema, data?.schema],
  );

  const handleCorrespondingFieldKeyUnique = useCallback(
    (key: string) =>
      keyUniqueCheck(
        key,
        selectedField?.typeProperty?.correspondingField?.id,
        referencedModel?.schema,
      ),
    [keyUniqueCheck, referencedModel?.schema, selectedField?.typeProperty?.correspondingField?.id],
  );

  const [createNewField, { loading: fieldCreationLoading }] = useMutation(CreateFieldDocument, {
    refetchQueries: ["GetModel", "GetGroup"],
  });

  const [updateField, { loading: fieldUpdateLoading }] = useMutation(UpdateFieldDocument, {
    refetchQueries: ["GetModel", "GetGroup"],
  });

  const [deleteFieldMutation] = useMutation(DeleteFieldDocument, {
    refetchQueries: ["GetModel", "GetGroup"],
  });

  const handleFieldDelete = useCallback(
    async (fieldId: string) => {
      if (!schemaId) return;
      const options = {
        variables: {
          fieldId,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
          metadata: isMeta,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
        },
      };
      const results = await deleteFieldMutation(options);
      if (results.error) {
        Notification.error({ message: t("Failed to delete field.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted field!") });
    },
    [schemaId, isMeta, selectedSchemaType, deleteFieldMutation, t],
  );

  const handleAllFieldDelete = useCallback(
    async (fieldIds: string[]) => {
      if (!schemaId) return;

      const options = fieldIds.map(fieldId => ({
        variables: {
          fieldId,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
          metadata: isMeta,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
        },
      }));

      const errors: string[] = [];

      for await (const option of options) {
        const result = await deleteFieldMutation(option);
        if (result.error) errors.push(result.error.message);
      }

      if (errors.length > 0) {
        Notification.error({ message: "Failed to delete all fields." });
        return;
      }
      Notification.success({ message: "Successfully deleted all fields!" });
    },
    [schemaId, isMeta, selectedSchemaType, deleteFieldMutation],
  );

  const handleFieldUpdate = useCallback(
    async (data: FormValues) => {
      if (!schemaId || !data.fieldId) return;
      const options = {
        variables: {
          description: data.description,
          fieldId: data.fieldId,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
          isTitle: data.isTitle,
          key: data.key,
          metadata: data.metadata,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
          multiple: data.multiple,
          required: data.required,
          title: data.title,
          typeProperty: data.typeProperty as SchemaFieldTypePropertyInput,
          unique: data.unique,
        },
      };
      const field = await updateField(options);
      if (field.error || !field.data?.updateField) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldModalShown(false);
    },
    [schemaId, selectedSchemaType, updateField, t],
  );

  const [updateFieldsOrder] = useMutation(UpdateFieldsDocument, {
    refetchQueries: ["GetModel"],
  });

  const handleFieldOrder = useCallback(
    async (fields: Field[]) => {
      if (!schemaId) return;
      const response = await updateFieldsOrder({
        variables: {
          updateFieldInput: fields.map((field, index) => ({
            fieldId: field.id,
            groupId: selectedSchemaType === "group" ? schemaId : undefined,
            metadata: field.metadata,
            modelId: selectedSchemaType === "model" ? schemaId : undefined,
            order: index,
          })),
        },
      });
      if (response.error || !response?.data?.updateFields) {
        Notification.error({ message: t("Failed to update field.") });
        return;
      }
      Notification.success({ message: t("Successfully updated field!") });
      setFieldModalShown(false);
    },
    [schemaId, updateFieldsOrder, t, selectedSchemaType],
  );

  const handleFieldCreate = useCallback(
    async (data: FormValues) => {
      if (!schemaId) return;
      const options = {
        variables: {
          description: data.description,
          groupId: selectedSchemaType === "group" ? schemaId : undefined,
          isTitle: data.isTitle,
          key: data.key,
          metadata: data.metadata,
          modelId: selectedSchemaType === "model" ? schemaId : undefined,
          multiple: data.multiple,
          required: data.required,
          title: data.title,
          type: data.type as GQLSchemaFieldType,
          typeProperty: data.typeProperty as SchemaFieldTypePropertyInput,
          unique: data.unique,
        },
      };
      const field = await createNewField(options);
      if (field.error || !field.data?.createField) {
        Notification.error({ message: t("Failed to create field.") });
        setFieldModalShown(false);
        return;
      }
      Notification.success({ message: t("Successfully created field!") });
      setFieldModalShown(false);
    },
    [schemaId, selectedSchemaType, createNewField, t],
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
  const [CheckGroupKeyAvailability] = useLazyQuery(CheckGroupKeyAvailabilityDocument, {
    fetchPolicy: "no-cache",
  });

  const { data: modelsByGroupData } = useQuery(ModelsByGroupDocument, {
    fetchPolicy: "cache-and-network",
    skip: !schemaId || selectedSchemaType !== "group",
    variables: {
      groupId: schemaId ?? "",
    },
  });

  const [deleteGroup, { loading: deleteGroupLoading }] = useMutation(DeleteGroupDocument, {
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
        error({
          content: `
          ${group?.name}${t("is used in", { modelNames })}
          ${t("If you want to delete it, please delete the field that uses it first.")}`,
          title: t("Group cannot be deleted"),
        });
        return;
      }

      const res = await deleteGroup({ variables: { groupId } });
      if (res.error || !res.data?.deleteGroup) {
        Notification.error({ message: t("Failed to delete group.") });
      } else {
        Notification.success({ message: t("Successfully deleted group!") });
        handleGroupDeletionModalClose();
        navigate(`/workspace/${workspaceId}/project/${projectId}/schema`);
      }
    },
    [
      deleteGroup,
      error,
      group?.name,
      handleGroupDeletionModalClose,
      modelsByGroupData?.modelsByGroup,
      navigate,
      projectId,
      t,
      workspaceId,
    ],
  );

  const [createNewGroup] = useMutation(CreateGroupDocument, {
    refetchQueries: ["GetGroups"],
  });

  const handleGroupCreate = useCallback(
    async (data: ModelFormValues) => {
      if (!projectId) return;
      const group = await createNewGroup({
        variables: {
          description: data.description,
          key: data.key,
          name: data.name,
          projectId,
        },
      });
      if (group.error || !group.data?.createGroup) {
        Notification.error({ message: t("Failed to create group.") });
        return;
      }
      Notification.success({ message: t("Successfully created group!") });
      handleGroupModalClose();
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/schema/${group.data?.createGroup.group.id}`,
      );
    },
    [projectId, createNewGroup, t, handleGroupModalClose, navigate, workspaceId],
  );

  const [updateNewGroup] = useMutation(UpdateGroupDocument, {
    refetchQueries: ["GetGroups"],
  });

  const handleGroupUpdate = useCallback(
    async (data: ModelFormValues) => {
      if (!data.id) return;
      const group = await updateNewGroup({
        variables: {
          description: data.description,
          groupId: data.id,
          key: data.key,
          name: data.name,
        },
      });
      if (group.error || !group.data?.updateGroup) {
        Notification.error({ message: t("Failed to update group.") });
        return;
      }
      Notification.success({ message: t("Successfully updated group!") });
      handleGroupModalClose();
    },
    [updateNewGroup, handleGroupModalClose, t],
  );

  const handleFieldCreationModalOpen = useCallback(
    (fieldType: SchemaFieldType) => {
      if (fieldType === "Group" && groups?.length === 0) {
        confirm({
          content: t("Please create a Group first to use the field"),
          okText: t("Create Group"),
          onCancel() {
            handleGroupModalClose();
          },
          onOk() {
            handleGroupModalOpen();
          },
          title: t("No available Group"),
        });
      } else {
        setSelectedType(fieldType);
        if (schemaId) setFieldModalShown(true);
      }
    },
    [confirm, groups?.length, handleGroupModalClose, handleGroupModalOpen, schemaId, t],
  );

  // model hooks
  const [CheckModelKeyAvailability] = useLazyQuery(CheckModelKeyAvailabilityDocument, {
    fetchPolicy: "no-cache",
  });

  const handleModelDeletionModalOpen = useCallback(
    () => setModelDeletionModalShown(true),
    [setModelDeletionModalShown],
  );

  const handleModelDeletionModalClose = useCallback(
    () => setModelDeletionModalShown(false),
    [setModelDeletionModalShown],
  );

  const [deleteModel, { loading: deleteModelLoading }] = useMutation(DeleteModelDocument, {
    refetchQueries: ["GetModels"],
  });

  const handleModelDelete = useCallback(
    async (modelId?: string) => {
      if (!modelId) return;
      const res = await deleteModel({ variables: { modelId } });
      if (res.error || !res.data?.deleteModel) {
        Notification.error({ message: t("Failed to delete model.") });
      } else {
        Notification.success({ message: t("Successfully deleted model!") });
        handleModelDeletionModalClose();
        setCurrentModel(undefined);
        navigate(`/workspace/${workspaceId}/project/${projectId}/schema`);
      }
    },
    [
      deleteModel,
      handleModelDeletionModalClose,
      navigate,
      projectId,
      setCurrentModel,
      t,
      workspaceId,
    ],
  );

  const [updateNewModel] = useMutation(UpdateModelDocument, {
    refetchQueries: ["GetModels"],
  });

  const handleModelModalClose = useCallback(() => setModelModalShown(false), []);
  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  const handleModelUpdate = useCallback(
    async (data: ModelFormValues) => {
      if (!data.id) return;
      const model = await updateNewModel({
        variables: {
          description: data.description,
          key: data.key,
          modelId: data.id,
          name: data.name,
        },
      });
      if (model.error || !model.data?.updateModel) {
        Notification.error({ message: t("Failed to update model.") });
        return;
      }
      Notification.success({ message: t("Successfully updated model!") });
      handleModelModalClose();
    },
    [updateNewModel, handleModelModalClose, t],
  );

  const handleKeyCheck = useCallback(
    async (key: string, ignoredKey?: string) => {
      if (!projectId || !key) return false;
      if (ignoredKey && key === ignoredKey) return true;
      if (isGroup) {
        const response = await CheckGroupKeyAvailability({ variables: { key, projectId } });
        return response.data ? response.data.checkGroupKeyAvailability.available : false;
      } else {
        const response = await CheckModelKeyAvailability({ variables: { key, projectId } });
        return response.data ? response.data.checkModelKeyAvailability.available : false;
      }
    },
    [CheckGroupKeyAvailability, CheckModelKeyAvailability, isGroup, projectId],
  );

  const handleModalOpen = useMemo(
    () => (selectedSchemaType === "model" ? handleModelModalOpen : handleGroupModalOpen),
    [handleGroupModalOpen, handleModelModalOpen, selectedSchemaType],
  );

  const handleModalClose = useMemo(
    () => (isGroup ? handleGroupModalClose : handleModelModalClose),
    [handleGroupModalClose, handleModelModalClose, isGroup],
  );

  const handleDeletionModalOpen = useMemo(
    () =>
      selectedSchemaType === "model" ? handleModelDeletionModalOpen : handleGroupDeletionModalOpen,
    [handleGroupDeletionModalOpen, handleModelDeletionModalOpen, selectedSchemaType],
  );

  const handleDeletionModalClose = useMemo(
    () => (isGroup ? handleGroupDeletionModalClose : handleModelDeletionModalClose),
    [handleGroupDeletionModalClose, handleModelDeletionModalClose, isGroup],
  );

  const handleSchemaCreate = useMemo(
    () => (isGroup ? handleGroupCreate : undefined),
    [handleGroupCreate, isGroup],
  );

  const handleSchemaUpdate = useMemo(
    () => (isGroup ? handleGroupUpdate : handleModelUpdate),
    [handleGroupUpdate, handleModelUpdate, isGroup],
  );

  const handleSchemaDelete = useMemo(
    () => (isGroup ? handleGroupDelete : handleModelDelete),
    [handleGroupDelete, handleModelDelete, isGroup],
  );

  const [createNewFields, { error: fieldsCreationError, loading: fieldsCreationLoading }] =
    useMutation(CreateFieldsDocument, {
      refetchQueries: ["GetModel", "GetGroup", "GetModels"],
    });

  const handleFieldsCreate = useCallback(
    async (fields: CreateFieldInput[]) => {
      if (!schemaId || fields.length === 0) return;
      const response = await createNewFields({
        variables: {
          inputs: fields.map(field => ({
            description: field.description,
            groupId: undefined,
            isTitle: field.isTitle,
            key: field.key,
            metadata: field.metadata,
            modelId: schemaId,
            multiple: field.multiple,
            required: field.required,
            title: field.title,
            type: field.type as GQLSchemaFieldType,
            typeProperty: field.typeProperty as SchemaFieldTypePropertyInput,
            unique: field.unique,
          })),
        },
      });

      if (response.error || !response.data?.createFields) {
        Notification.error({ message: t("Failed to create fields.") });
        return;
      }

      Notification.success({ message: t("Successfully created fields!") });
    },
    [schemaId, createNewFields, t],
  );

  return {
    collapsed,
    data,
    deleteGroupLoading,
    deleteModelLoading,
    fieldCreationLoading,
    fieldModalShown,
    fieldsCreationError: !!fieldsCreationError,
    fieldsCreationLoading,
    fieldUpdateLoading,
    groupDeletionModalShown,
    groupModalShown,
    groups,
    handleAllFieldDelete,
    handleCorrespondingFieldKeyUnique,
    handleDeletionModalClose,
    handleDeletionModalOpen,
    handleFieldCreate,
    handleFieldCreationModalOpen,
    handleFieldDelete,
    handleFieldKeyUnique,
    handleFieldModalClose,
    handleFieldOrder,
    handleFieldsCreate,
    handleFieldUpdate,
    handleFieldUpdateModalOpen,
    handleGroupSelect,
    handleKeyCheck,
    handleModalClose,
    handleModalOpen,
    handleModelSelect,
    handleReferencedModelGet,
    handleSchemaCreate,
    handleSchemaDelete,
    handleSchemaUpdate,
    hasCreateRight,
    hasDeleteRight,
    hasUpdateRight,
    isMeta,
    modelDeletionModalShown,
    modelModalShown,
    models,
    projectId,
    selectedField,
    selectedSchemaType,
    selectedType,
    setCollapsed,
    setIsMeta,
    workspaceId,
  };
};
