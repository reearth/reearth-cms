import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { filterConvert } from "@reearth-cms/components/organisms/Project/Content/ContentList/utils";
import {
  FieldType,
  SortDirection,
  View,
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
  AndCondition,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

import { CurrentViewType } from "../ContentList/hooks";

type Params = {
  modelId?: string;
  currentView: CurrentViewType;
  setCurrentView: Dispatch<SetStateAction<CurrentViewType>>;
};

export type modalStateType = "rename" | "create";

export default ({ modelId, currentView, setCurrentView }: Params) => {
  const t = useT();
  const [prevModelId, setPrevModelId] = useState<string>();
  const [viewModalShown, setViewModalShown] = useState(false);
  const [selectedView, setSelectedView] = useState<View>();
  const [modalState, setModalState] = useState<modalStateType>("create");
  const [submitting, setSubmitting] = useState(false);
  const [currentProject] = useProject();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data } = useGetViewsQuery({
    variables: { modelId: modelId ?? "" },
    skip: !modelId,
  });

  const views = useMemo(() => {
    if (prevModelId !== modelId && data?.view) {
      setSelectedView(data?.view && data?.view.length > 0 ? (data?.view[0] as View) : undefined);
      setPrevModelId(modelId);
    }
    return data?.view ? data?.view : [];
  }, [data?.view, modelId, prevModelId]);

  useEffect(() => {
    if (selectedView) {
      setCurrentView(prev => ({
        ...prev,
        sort: {
          field: {
            id: selectedView.sort?.field.id ? selectedView.sort?.field.id : undefined,
            type:
              selectedView.sort?.field.type && selectedView.sort?.field.id
                ? selectedView.sort?.field.type
                : FieldType["Id"],
          },
          direction: selectedView.sort?.direction
            ? selectedView.sort?.direction
            : SortDirection["Asc"],
        },
        columns: selectedView.columns ? selectedView.columns : [],
        filter: filterConvert(selectedView.filter as AndCondition),
      }));
    } else {
      setCurrentView({ columns: [] });
    }
  }, [selectedView, setCurrentView]);

  const handleViewRenameModalOpen = useCallback(() => {
    setModalState("rename");
    setViewModalShown(true);
  }, []);

  const handleViewCreateModalOpen = useCallback(() => {
    setModalState("create");
    setViewModalShown(true);
  }, []);

  const handleViewModalReset = useCallback(() => {
    setViewModalShown(false);
    setSubmitting(false);
  }, [setViewModalShown, setSubmitting]);

  const [createNewView] = useCreateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewCreate = useCallback(
    async (data: { name: string }) => {
      setSubmitting(true);
      const view = await createNewView({
        variables: {
          name: data.name,
          projectId: projectId ?? "",
          modelId: modelId ?? "",
          sort: currentView?.sort,
          columns: currentView?.columns,
          filter: currentView.filter
            ? {
                and: currentView.filter,
              }
            : undefined,
        },
      });
      if (view.errors || !view.data?.createView) {
        Notification.error({ message: t("Failed to create view.") });
        return;
      }
      setSelectedView(view.data.createView.view as View);
      setViewModalShown(false);
      Notification.success({ message: t("Successfully created view!") });
    },
    [
      createNewView,
      projectId,
      modelId,
      currentView?.sort,
      currentView?.columns,
      currentView?.filter,
      t,
    ],
  );

  const [updateNewView] = useUpdateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewUpdate = useCallback(
    async (viewId: string, name: string) => {
      if (!viewId) return;
      setSubmitting(true);
      const view = await updateNewView({
        variables: {
          viewId: viewId,
          name: name,
          sort: currentView?.sort,
          columns: currentView?.columns,
          filter: currentView.filter
            ? {
                and: currentView.filter,
              }
            : undefined,
        },
      });
      if (view.errors || !view.data?.updateView) {
        Notification.error({ message: t("Failed to update view.") });
        return;
      }
      setSelectedView(view.data.updateView.view as View);
      Notification.success({ message: t("Successfully updated view!") });
      handleViewModalReset();
    },
    [updateNewView, currentView, t, handleViewModalReset],
  );

  const handleViewRename = useCallback(
    async (data: { viewId?: string; name: string }) => {
      if (!data.viewId) return;
      setSubmitting(true);
      const view = await updateNewView({
        variables: {
          viewId: data.viewId,
          name: data.name,
        },
      });
      if (view.errors || !view.data?.updateView) {
        Notification.error({ message: t("Failed to rename view.") });
        return;
      }
      setSelectedView(view.data.updateView.view as View);
      Notification.success({ message: t("Successfully renamed view!") });
      handleViewModalReset();
    },
    [handleViewModalReset, t, updateNewView, setSubmitting],
  );

  const [deleteView] = useDeleteViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewDeletionModalClose = useCallback(() => {
    setSelectedView(views[0] as View);
  }, [views]);

  const handleViewDelete = useCallback(
    async (viewId?: string) => {
      if (!viewId) return;
      const res = await deleteView({ variables: { viewId } });
      if (res.errors || !res.data?.deleteView) {
        Notification.error({ message: t("Failed to delete view.") });
      } else {
        Notification.success({ message: t("Successfully deleted view!") });
        handleViewDeletionModalClose();
      }
    },
    [deleteView, handleViewDeletionModalClose, t],
  );

  return {
    views,
    modalState,
    handleViewRenameModalOpen,
    handleViewCreateModalOpen,
    handleViewDelete,
    handleViewDeletionModalClose,
    selectedView,
    setSelectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
    handleViewRename,
  };
};
