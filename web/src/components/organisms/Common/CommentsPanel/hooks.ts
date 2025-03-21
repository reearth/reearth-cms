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
import { useWorkspaceId, useUserRights, useUserId } from "@reearth-cms/state";

type Params = {
  resourceId?: string;
  resourceType: ResourceType;
  threadId?: string;
  refetchQueries: RefetchQueries;
};

export default ({ resourceId, resourceType, threadId, refetchQueries }: Params) => {
  const t = useT();
  const [currentWorkspaceId] = useWorkspaceId();
  const [userId] = useUserId();

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
    async (content: string) => {
      try {
        if (!threadId) {
          const { data, errors } = await createThreadWithComment({
            variables: {
              workspaceId: currentWorkspaceId ?? "",
              resourceId: resourceId ?? "",
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
    [
      threadId,
      createComment,
      t,
      createThreadWithComment,
      currentWorkspaceId,
      resourceId,
      resourceType,
    ],
  );

  const [updateComment] = useUpdateCommentMutation({
    refetchQueries,
  });

  const handleCommentUpdate = useCallback(
    async (commentId: string, content: string) => {
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
    [updateComment, threadId, t],
  );

  const [deleteComment] = useDeleteCommentMutation({
    refetchQueries,
  });

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
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
    [deleteComment, threadId, t],
  );

  return {
    userId: userId ?? "",
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
  };
};
