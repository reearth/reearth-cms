import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  View,
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

import { CurrentViewType } from "../ContentList/hooks";

type Params = {
  modelId?: string;
  currentView: CurrentViewType;
  // setCurrentView: (view: CurrentViewType) => void;
};

export default ({ modelId, currentView }: Params) => {
  const t = useT();
  const [viewModalShown, setViewModalShown] = useState(false);
  const [selectedView, setSelectedView] = useState<View>();
  const [submitting, setSubmitting] = useState(false);
  const [currentProject] = useProject();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data } = useGetViewsQuery({
    variables: { modelId: modelId ?? "" },
    skip: !modelId,
  });

  const views = useMemo(() => {
    return data?.view ? data?.view : [];
  }, [data?.view]);

  const handleViewModalOpen = useCallback(() => setViewModalShown(true), []);

  const handleViewRenameModalOpen = useCallback(
    async (view: View) => {
      setSelectedView(view);
      handleViewModalOpen();
    },
    [setSelectedView, handleViewModalOpen],
  );

  const handleViewModalReset = useCallback(() => {
    setSelectedView(undefined);
    setViewModalShown(false);
    setSubmitting(false);
  }, [setSelectedView, setViewModalShown, setSubmitting]);

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
      Notification.success({ message: t("Successfully renamed view!") });
      handleViewModalReset();
    },
    [handleViewModalReset, t, updateNewView, setSubmitting],
  );

  const [deleteView] = useDeleteViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewDeletionModalClose = useCallback(() => {
    setSelectedView(undefined);
  }, [setSelectedView]);

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
    handleViewModalOpen,
    handleViewRenameModalOpen,
    handleViewDelete,
    handleViewDeletionModalClose,
    selectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
    handleViewRename,
  };
};
