import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { View } from "@reearth-cms/components/molecules/View/types";
import {
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

type Params = {
  modelId?: string;
};

export default ({ modelId }: Params) => {
  const t = useT();
  const [viewModalShown, setViewModalShown] = useState(false);
  const [selectedView, setSelectedView] = useState<View>();
  const [currentProject] = useProject();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data } = useGetViewsQuery({
    variables: { modelId: modelId ?? "" },
  });

  const views = useMemo(() => {
    return data?.view;
  }, [data]);

  const handleViewModalOpen = useCallback(() => setViewModalShown(true), []);

  const handleViewUpdateModalOpen = useCallback(
    async (view: View) => {
      setSelectedView(view);
      handleViewModalOpen();
    },
    [setSelectedView, handleViewModalOpen],
  );

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
  }, [setSelectedView, setViewModalShown]);

  const [createNewView] = useCreateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewCreate = useCallback(
    async (data: { name: string }) => {
      const view = await createNewView({
        variables: {
          name: data.name,
          projectId: projectId ?? "",
          modelId: modelId ?? "",
        },
      });
      if (view.errors || !view.data?.createView) {
        Notification.error({ message: t("Failed to create view.") });
        return;
      }
      setViewModalShown(false);
    },
    [createNewView, projectId, modelId, t],
  );

  const [updateNewView] = useUpdateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewUpdate = useCallback(
    async (data: { viewId?: string; name: string }) => {
      if (!data.viewId) return;
      const view = await updateNewView({
        variables: {
          viewId: data.viewId,
          name: data.name,
        },
      });
      if (view.errors || !view.data?.updateView) {
        Notification.error({ message: t("Failed to update view.") });
        return;
      }
      Notification.success({ message: t("Successfully updated model!") });
      handleViewModalReset();
    },
    [handleViewModalReset, t, updateNewView],
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
    handleViewUpdateModalOpen,
    handleViewRenameModalOpen,
    handleViewDelete,
    handleViewDeletionModalClose,
    selectedView,
    viewModalShown,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
  };
};
