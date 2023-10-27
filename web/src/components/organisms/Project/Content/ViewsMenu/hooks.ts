import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { View } from "@reearth-cms/components/molecules/View/types";
import {
  View as GQLView,
  useCreateViewMutation,
  useDeleteViewMutation,
  useGetViewsQuery,
  useUpdateViewMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";
import { fromGraphQLView } from "@reearth-cms/utils/values";

type Params = {
  modelId?: string;
};

export default ({ modelId }: Params) => {
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
    return data?.view
      ?.map(view => (view ? fromGraphQLView(view as GQLView) : undefined))
      .filter((view): view is View => !!view);
  }, [data?.view]);

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
        },
      });
      if (view.errors || !view.data?.createView) {
        Notification.error({ message: t("Failed to create view.") });
        return;
      }
      setViewModalShown(false);
      Notification.success({ message: t("Successfully created view!") });
    },
    [createNewView, projectId, modelId, t, setSubmitting],
  );

  const [updateNewView] = useUpdateViewMutation({
    refetchQueries: ["GetViews"],
  });

  const handleViewUpdate = useCallback(
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
        Notification.error({ message: t("Failed to update view.") });
        return;
      }
      Notification.success({ message: t("Successfully updated view!") });
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
    handleViewUpdateModalOpen,
    handleViewRenameModalOpen,
    handleViewDelete,
    handleViewDeletionModalClose,
    selectedView,
    viewModalShown,
    submitting,
    handleViewModalReset,
    handleViewCreate,
    handleViewUpdate,
  };
};
