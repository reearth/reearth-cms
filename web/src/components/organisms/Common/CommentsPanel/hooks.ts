import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  RefetchQueries,
  ResourceType,
} from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import {
  ResourceType as GQLResourceType,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useCreateThreadWithCommentMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspaceId, useUserRights } from "@reearth-cms/state";

type Params = {
  resourceType: ResourceType;
  refetchQueries: RefetchQueries;
};

export default ({ resourceType, refetchQueries }: Params) => {
  const t = useT();
  const [currentWorkspaceId] = useWorkspaceId();

  const [userRights] = useUserRights();
  const hasCreateRight = useMemo(() => !!userRights?.comment.create, [userRights?.comment.create]);
  const hasUpdateRight = useMemo(
    () => userRights?.comment.update !== undefined && userRights.comment.update,
    [userRights?.comment.update],
  );
  const hasDeleteRight = useMemo(
    () => userRights?.comment.delete !== undefined && userRights.comment.delete,
    [userRights?.comment.delete],
  );

  const [createThreadWithComment] = useCreateThreadWithCommentMutation({
    refetchQueries,
  });

  const [createComment] = useAddCommentMutation({
    refetchQueries,
  });

  const handleCommentCreate = useCallback(
    async (content: string, resourceId: string, threadId: string) => {
      try {
        if (!threadId) {
          const { data, errors } = await createThreadWithComment({
            variables: {
              workspaceId: currentWorkspaceId ?? "",
              resourceId,
              resourceType: resourceType as GQLResourceType,
              content,
            },
          });

          if (errors || !data?.createThreadWithComment?.thread?.id) {
            Notification.error({ message: t("Failed to create thread.") });
            return;
          }
        } else {
          const { data: commentData, errors: commentErrors } = await createComment({
            variables: { threadId, content },
          });

          if (commentErrors || !commentData?.addComment) {
            Notification.error({ message: t("Failed to create comment.") });
            return;
          }
        }
        Notification.success({ message: t("Successfully created comment!") });
      } catch (error) {
        Notification.error({ message: t("An unexpected error occurred.") });
        console.error("Error creating comment:", error);
      }
    },
    [createComment, t, createThreadWithComment, currentWorkspaceId, resourceType],
  );

  const [updateComment] = useUpdateCommentMutation({
    refetchQueries,
  });

  const handleCommentUpdate = useCallback(
    async (commentId: string, content: string, threadId: string) => {
      if (!threadId) return;
      const comment = await updateComment({
        variables: {
          threadId,
          commentId,
          content,
        },
      });
      if (comment.errors || !comment.data?.updateComment) {
        Notification.error({ message: t("Failed to update comment.") });
        return;
      }
      Notification.success({ message: t("Successfully updated comment!") });
    },
    [updateComment, t],
  );

  const [deleteComment] = useDeleteCommentMutation({
    refetchQueries,
  });

  const handleCommentDelete = useCallback(
    async (commentId: string, threadId: string) => {
      if (!threadId) return;
      const comment = await deleteComment({
        variables: {
          threadId,
          commentId,
        },
      });
      if (comment.errors || !comment.data?.deleteComment) {
        Notification.error({ message: t("Failed to delete comment.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted comment!") });
    },
    [deleteComment, t],
  );

  return {
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
  };
};
