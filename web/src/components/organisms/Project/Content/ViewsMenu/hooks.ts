import { useCallback, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { CurrentView } from "@reearth-cms/components/molecules/View/types";
import {
  toGraphColumnSelectionInput,
  toGraphItemSort,
  toGraphConditionInput,
} from "@reearth-cms/components/organisms/DataConverters/table";
import {
  useCreateViewMutation,
  useDeleteViewMutation,
  useUpdateViewMutation,
  useUpdateViewsOrderMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useModel } from "@reearth-cms/state";

interface Params {
  currentView: CurrentView;
  onViewChange: () => void;
}

export type modalStateType = "rename" | "create";

export default ({ currentView, onViewChange }: Params) => {
  const t = useT();
  const [viewModalShown, setViewModalShown] = useState(false);
  const [modalState, setModalState] = useState<modalStateType>("create");
  const [submitting, setSubmitting] = useState(false);
  const [currentProject] = useProject();
  const [currentModel] = useModel();

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
          projectId: currentProject?.id ?? "",
          modelId: currentModel?.id ?? "",
          sort: toGraphItemSort(currentView.sort),
          columns: toGraphColumnSelectionInput(currentView.columns),
          filter: toGraphConditionInput(currentView.filter),
        },
      });
      if (view.errors || !view.data?.createView) {
        Notification.error({ message: t("Failed to create view.") });
        return;
      }
      setViewModalShown(false);
      onViewChange();
      Notification.success({ message: t("Successfully created view!") });
    },
    [
      createNewView,
      currentProject?.id,
      currentModel?.id,
      currentView?.sort,
      currentView?.columns,
      currentView.filter,
      onViewChange,
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
          sort: toGraphItemSort(currentView.sort),
          columns: toGraphColumnSelectionInput(currentView.columns),
          filter: toGraphConditionInput(currentView.filter),
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
          sort: toGraphItemSort(currentView?.sort),
          columns: toGraphColumnSelectionInput(currentView.columns),
          filter: toGraphConditionInput(currentView.filter),
        },
      });
      if (view.errors || !view.data?.updateView) {
        Notification.error({ message: t("Failed to rename view.") });
        return;
      }
      Notification.success({ message: t("Successfully renamed view!") });
      handleViewModalReset();
    },
    [handleViewModalReset, t, updateNewView, setSubmitting, currentView],
  );

  const [deleteView] = useDeleteViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewDelete = useCallback(
    async (viewId?: string) => {
      if (!viewId) return;
      const res = await deleteView({ variables: { viewId } });
      if (res.errors || !res.data?.deleteView) {
        Notification.error({ message: t("Failed to delete view.") });
      } else {
        Notification.success({ message: t("Successfully deleted view!") });
        onViewChange();
      }
    },
    [deleteView, onViewChange, t],
  );

  const [updateViewsOrder] = useUpdateViewsOrderMutation({
    refetchQueries: ["GetViews"],
  });

  const handleUpdateViewsOrder = useCallback(
    async (viewIds: string[]) => {
      const view = await updateViewsOrder({
        variables: {
          viewIds,
        },
      });
      if (view.errors) {
        Notification.error({ message: t("Failed to update views order.") });
        return;
      }
      Notification.success({ message: t("Successfully updated views order!") });
    },
    [updateViewsOrder, t],
  );

  return {
    modalState,
    handleViewRenameModalOpen,
    handleViewCreateModalOpen,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
    handleViewRename,
    handleViewDelete,
    handleUpdateViewsOrder,
  };
};
