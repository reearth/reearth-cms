import { useMutation, useQuery } from "@apollo/client/react";
import fileDownload from "js-file-download";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ExportFormat, Model } from "@reearth-cms/components/molecules/Model/types";
import { ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";
import { SortBy, UpdateProjectInput } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import useModelHooks from "@reearth-cms/components/organisms/Project/ModelsMenu/hooks";
import {
  ExportFormat as GQLExportFormat,
  Model as GQLModel,
  ProjectAccessibility as GQLProjectAccessibility,
  Role as GQLRole,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  DeleteModelDocument,
  ExportModelDocument,
  ExportModelSchemaDocument,
  GetModelsDocument,
  UpdateModelDocument,
} from "@reearth-cms/gql/__generated__/model.generated";
import { UpdateProjectDocument } from "@reearth-cms/gql/__generated__/project.generated";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserRights, useWorkspace } from "@reearth-cms/state";

export default () => {
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.model.create, [userRights?.model.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.model.update, [userRights?.model.update]);
  const hasDeleteRight = useMemo(() => !!userRights?.model.delete, [userRights?.model.delete]);
  const hasSchemaCreateRight = useMemo(
    () => !!userRights?.schema.create,
    [userRights?.schema.create],
  );
  const hasContentCreateRight = useMemo(
    () => !!userRights?.content.create,
    [userRights?.content.create],
  );

  const [selectedModel, setSelectedModel] = useState<Model | undefined>();
  const [modelDeletionModalShown, setModelDeletionModalShown] = useState(false);
  const [searchedModelName, setSearchedModelName] = useState<string>("");
  const [modelSort, setModelSort] = useState<SortBy>("updatedat");
  const t = useT();
  const navigate = useNavigate();

  const {
    handleModelCreate,
    handleModelKeyCheck,
    handleModelModalClose,
    handleModelModalOpen,
    modelModalShown,
  } = useModelHooks({});

  const [updateProjectMutation] = useMutation(UpdateProjectDocument, {
    refetchQueries: ["GetProject"],
  });

  const handleProjectUpdate = useCallback(
    async (data: UpdateProjectInput) => {
      if (!data.projectId) return;
      const Project = await updateProjectMutation({
        variables: {
          accessibility: data.accessibility as GQLProjectAccessibility,
          alias: data.alias,
          description: data.description,
          license: data.license,
          name: data.name,
          projectId: data.projectId,
          readme: data.readme,
          requestRoles: data.requestRoles as GQLRole[],
        },
      });
      if (Project.error || !Project.data?.updateProject) {
        Notification.error({ message: t("Failed to update Project.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Project!") });
    },
    [updateProjectMutation, t],
  );

  const { data } = useQuery(GetModelsDocument, {
    fetchPolicy: "cache-and-network",
    skip: !currentProject?.id,
    variables: {
      keyword: searchedModelName,
      pagination: { first: 100 },
      projectId: currentProject?.id ?? "",
      sort: { key: modelSort, reverted: false },
    },
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

  const [deleteModel, { loading: deleteLoading }] = useMutation(DeleteModelDocument, {
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
      }
    },
    [deleteModel, handleModelDeletionModalClose, t],
  );

  const [updateNewModel] = useMutation(UpdateModelDocument, {
    refetchQueries: ["GetModels"],
  });

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

  const [exportModel, { loading: exportModelLoading }] = useMutation(ExportModelDocument);
  const [exportModelSchema, { loading: exportSchemaLoading }] =
    useMutation(ExportModelSchemaDocument);

  const exportLoading = exportModelLoading || exportSchemaLoading;

  const getFilenameFromFormat = useCallback((modelId: string, format: ExportFormat): string => {
    switch (format) {
      case ExportFormat.Schema:
        return `${modelId}-schema.json`;
      case ExportFormat.Json:
        return `${modelId}-data.json`;
      case ExportFormat.Csv:
        return `${modelId}-data.csv`;
      case ExportFormat.Geojson:
        return `${modelId}-data.geojson`;
      default:
        return `${modelId}-data.json`;
    }
  }, []);

  const downloadFile = useCallback(
    async (url: string, filename: string) => {
      try {
        const response = await fetch(url, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to download ${filename}`);
        }
        const blob = await response.blob();
        fileDownload(blob, filename);
        Notification.success({
          description: filename,
          message: t("Download successful"),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Download error:", errorMessage);
        Notification.error({
          description: errorMessage,
          message: t("Download failed"),
        });
      }
    },
    [t],
  );

  const handleModelExport = useCallback(
    async (modelId?: string, format?: ExportFormat): Promise<void> => {
      if (!modelId || !format) return;

      try {
        if (format === ExportFormat.Schema) {
          // Export schema
          const res = await exportModelSchema({ variables: { modelId } });
          if (res.error || !res.data?.exportModelSchema) {
            throw new Error(t("Failed to export schema."));
          }
          const url = res.data.exportModelSchema.url;
          const filename = getFilenameFromFormat(modelId, format);
          await downloadFile(url, filename);
        } else {
          // Export model data (JSON, CSV, or GeoJSON)
          const exportFormat = format as GQLExportFormat;
          const res = await exportModel({
            variables: { format: exportFormat, modelId },
          });
          if (res.error || !res.data?.exportModel) {
            throw new Error(t("Failed to export model data."));
          }
          const url = res.data.exportModel.url;
          const filename = getFilenameFromFormat(modelId, format);
          await downloadFile(url, filename);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Export error:", errorMessage);
        Notification.error({
          description: errorMessage,
          message: t("Export failed"),
        });
      }
    },
    [exportModel, exportModelSchema, t, downloadFile, getFilenameFromFormat],
  );

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

  const handleImportSchemaNavigation = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/schema/${modelId}`,
        { state: { isImportModalOpen: true } },
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

  const handleImportContentNavigation = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}`,
        { state: { isImportModalOpen: true } },
      );
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

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
    deleteLoading,
    exportLoading,
    handleContentNavigation,
    handleHomeNavigation,
    handleImportContentNavigation,
    handleImportSchemaNavigation,
    handleModelCreate,
    handleModelDelete,
    handleModelDeletionModalClose,
    handleModelDeletionModalOpen,
    handleModelExport,
    handleModelKeyCheck,
    handleModelModalOpen,
    handleModelModalReset,
    handleModelSearch,
    handleModelSort,
    handleModelUpdate,
    handleModelUpdateModalOpen,
    handleProjectUpdate,
    handleSchemaNavigation,
    hasContentCreateRight,
    hasCreateRight,
    hasDeleteRight,
    hasSchemaCreateRight,
    hasUpdateRight,
    modelDeletionModalShown,
    modelModalShown,
    models,
    selectedModel,
  };
};
