import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { CurrentView } from "@reearth-cms/components/molecules/View/types";
import {
  toGraphColumnSelectionInput,
  toGraphConditionInput,
  toGraphItemSort,
} from "@reearth-cms/components/organisms/DataConverters/table";
import {
  CreateViewDocument,
  DeleteViewDocument,
  UpdateViewDocument,
  UpdateViewsOrderDocument,
} from "@reearth-cms/gql/__generated__/view.generated";
import { useT } from "@reearth-cms/i18n";
import { useModel, useProject, useUserRights } from "@reearth-cms/state";

type Params = {
  currentView: CurrentView;
  onViewChange: () => void;
};

export type modalStateType = "create" | "rename";

export default ({ currentView, onViewChange }: Params) => {
  const t = useT();
  const [viewModalShown, setViewModalShown] = useState(false);
  const [modalState, setModalState] = useState<modalStateType>("create");
  const [currentProject] = useProject();
  const [currentModel] = useModel();
  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.view.create, [userRights?.view.create]);
  const hasUpdateRight = useMemo(() => !!userRights?.view.update, [userRights?.view.update]);
  const hasDeleteRight = useMemo(() => !!userRights?.view.delete, [userRights?.view.delete]);

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
  }, [setViewModalShown]);

  const [createNewView, { loading: createLoading }] = useMutation(CreateViewDocument, {
    refetchQueries: ["GetViews"],
  });

  const handleViewCreate = useCallback(
    async (name: string) => {
      const view = await createNewView({
        variables: {
          columns: toGraphColumnSelectionInput(currentView.columns),
          filter: toGraphConditionInput(currentView.filter),
          modelId: currentModel?.id ?? "",
          name,
          projectId: currentProject?.id ?? "",
          sort: toGraphItemSort(currentView.sort),
        },
      });
      if (view.error || !view.data?.createView) {
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

  const [updateNewView, { loading: updateLoading }] = useMutation(UpdateViewDocument, {
    refetchQueries: ["GetViews"],
  });

  const handleViewUpdate = useCallback(
    async (viewId: string, name: string) => {
      const view = await updateNewView({
        variables: {
          columns: toGraphColumnSelectionInput(currentView.columns),
          filter: toGraphConditionInput(currentView.filter),
          name,
          sort: toGraphItemSort(currentView.sort),
          viewId,
        },
      });
      if (view.error || !view.data?.updateView) {
        Notification.error({ message: t("Failed to update view.") });
        return;
      }
      Notification.success({ message: t("Successfully updated view!") });
      handleViewModalReset();
    },
    [updateNewView, currentView, t, handleViewModalReset],
  );

  const handleViewRename = useCallback(
    async (viewId: string, name: string) => {
      const view = await updateNewView({
        variables: {
          columns: toGraphColumnSelectionInput(currentView.columns),
          filter: toGraphConditionInput(currentView.filter),
          name,
          sort: toGraphItemSort(currentView?.sort),
          viewId,
        },
      });
      if (view.error || !view.data?.updateView) {
        Notification.error({ message: t("Failed to rename view.") });
        return;
      }
      Notification.success({ message: t("Successfully renamed view!") });
      handleViewModalReset();
    },
    [handleViewModalReset, t, updateNewView, currentView],
  );

  const [deleteView] = useMutation(DeleteViewDocument, {
    refetchQueries: ["GetViews"],
  });

  const handleViewDelete = useCallback(
    async (viewId: string) => {
      const res = await deleteView({ variables: { viewId } });
      if (res.error || !res.data?.deleteView) {
        Notification.error({ message: t("Failed to delete view.") });
      } else {
        Notification.success({ message: t("Successfully deleted view!") });
        onViewChange();
      }
    },
    [deleteView, onViewChange, t],
  );

  const [updateViewsOrder] = useMutation(UpdateViewsOrderDocument, {
    refetchQueries: ["GetViews"],
  });

  const handleUpdateViewsOrder = useCallback(
    async (viewIds: string[]) => {
      const view = await updateViewsOrder({
        variables: {
          viewIds,
        },
      });
      if (view.error) {
        Notification.error({ message: t("Failed to update views order.") });
        return;
      }
      Notification.success({ message: t("Successfully updated views order!") });
    },
    [updateViewsOrder, t],
  );

  return {
    handleUpdateViewsOrder,
    handleViewCreate,
    handleViewCreateModalOpen,
    handleViewDelete,
    handleViewModalReset,
    handleViewRename,
    handleViewRenameModalOpen,
    handleViewUpdate,
    hasCreateRight,
    hasDeleteRight,
    hasUpdateRight,
    modalState,
    submitting: createLoading || updateLoading,
    viewModalShown,
  };
};
