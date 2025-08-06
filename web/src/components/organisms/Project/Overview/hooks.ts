import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";
import { SortBy, UpdateProjectInput } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import useModelHooks from "@reearth-cms/components/organisms/Project/ModelsMenu/hooks";
import {
  useDeleteModelMutation,
  useGetModelsQuery,
  useUpdateModelMutation,
  Model as GQLModel,
  Role as GQLRole,
  ProjectAccessibility as GQLProjectAccessibility,
  useUpdateProjectMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace, useUserRights } from "@reearth-cms/state";

export default () => {
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.model.create, [userRights?.model.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.model.update, [userRights?.model.update]);
  const hasDeleteRight = useMemo(() => !!userRights?.model.delete, [userRights?.model.delete]);

  const [selectedModel, setSelectedModel] = useState<Model | undefined>();
  const [modelDeletionModalShown, setModelDeletionModalShown] = useState(false);
  const [modelExportModalShown, setModelExportModalShown] = useState(false);
  const [searchedModelName, setSearchedModelName] = useState<string>("");
  const [modelSort, setModelSort] = useState<SortBy>("updatedAt");
  const t = useT();
  const navigate = useNavigate();

  const {
    modelModalShown,
    handleModelModalClose,
    handleModelModalOpen,
    handleModelCreate,
    handleModelKeyCheck,
  } = useModelHooks({});

  const [updateProjectMutation] = useUpdateProjectMutation({
    refetchQueries: ["GetProject"],
  });

  const handleProjectUpdate = useCallback(
    async (data: UpdateProjectInput) => {
      if (!data.projectId) return;
      const Project = await updateProjectMutation({
        variables: {
          projectId: data.projectId,
          name: data.name,
          description: data.description,
          readme: data.readme,
          license: data.license,
          alias: data.alias,
          requestRoles: data.requestRoles as GQLRole[],
          accessibility: data.accessibility as GQLProjectAccessibility,
        },
      });
      if (Project.errors || !Project.data?.updateProject) {
        Notification.error({ message: t("Failed to update Project.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Project!") });
    },
    [updateProjectMutation, t],
  );

  const { data } = useGetModelsQuery({
    variables: {
      projectId: currentProject?.id ?? "",
      keyword: searchedModelName,
      sort: { key: modelSort, reverted: false },
      pagination: { first: 100 },
    },
    skip: !currentProject?.id,
  });

  const models = useMemo(
    () =>
      data?.models.nodes
        .map(model => (model ? fromGraphQLModel(model as GQLModel) : undefined))
        .filter(model => !!model) ?? [],
    [data?.models.nodes],
  );

  const handleModelUpdateModalOpen = useCallback(
    async (model: Model) => {
      setSelectedModel(model);
      handleModelModalOpen();
    },
    [setSelectedModel, handleModelModalOpen],
  );

  const handleModelExportModalOpen = useCallback(
    async (model: Model) => {
      setSelectedModel(model);
      setModelExportModalShown(true);
    },
    [setSelectedModel, setModelExportModalShown],
  );

  const handleModelExportModalClose = useCallback(async () => {
    setSelectedModel(undefined);
    setModelExportModalShown(false);
  }, [setSelectedModel, setModelExportModalShown]);

  const handleModelDeletionModalOpen = useCallback(
    async (model: Model) => {
      setSelectedModel(model);
      setModelDeletionModalShown(true);
    },
    [setSelectedModel, setModelDeletionModalShown],
  );

  const handleModelDeletionModalClose = useCallback(() => {
    setSelectedModel(undefined);
    setModelDeletionModalShown(false);
  }, [setSelectedModel, setModelDeletionModalShown]);

  const [deleteModel, { loading: deleteLoading }] = useDeleteModelMutation({
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

  const handleModelUpdate = useCallback(
    async (data: ModelFormValues) => {
      if (!data.id) return;
      const model = await updateNewModel({
        variables: {
          modelId: data.id,
          name: data.name,
          description: data.description,
          key: data.key,
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

  // TODO: implement this function
  const exportLoading = false;

  // TODO: implement this function
  const handleModelExport = useCallback(async (modelId?: string, format?: string) => {
    if (!modelId && !format) return;
  }, []);

  const handleHomeNavigation = useCallback(() => {
    navigate(`/workspace/${currentWorkspace?.id}`);
  }, [currentWorkspace?.id, navigate]);

  const handleSchemaNavigation = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/schema/${modelId}`,
      );
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

  const handleContentNavigation = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}`,
      );
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

  const handleGoToAssets = useCallback(() => {
    navigate(`/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/asset`);
  }, [currentWorkspace?.id, currentProject?.id, navigate]);

  const handleModelModalReset = useCallback(() => {
    setSelectedModel(undefined);
    handleModelModalClose();
  }, [handleModelModalClose]);

  const handleModelSearch = useCallback((value: string) => {
    setSearchedModelName(value);
  }, []);

  const handleModelSort = useCallback((sort: SortBy) => {
    setModelSort(sort);
  }, []);

  return {
    currentProject,
    models,
    modelModalShown,
    selectedModel,
    modelDeletionModalShown,
    modelExportModalShown,
    deleteLoading,
    exportLoading,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleProjectUpdate,
    handleModelSearch,
    handleModelSort,
    handleHomeNavigation,
    handleSchemaNavigation,
    handleContentNavigation,
    handleGoToAssets,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalReset,
    handleModelCreate,
    handleModelDeletionModalOpen,
    handleModelDeletionModalClose,
    handleModelUpdateModalOpen,
    handleModelExportModalOpen,
    handleModelExportModalClose,
    handleModelDelete,
    handleModelExport,
    handleModelUpdate,
  };
};
