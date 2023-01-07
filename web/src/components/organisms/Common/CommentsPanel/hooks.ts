import { useCallback } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { useAddCommentMutation, useDeleteCommentMutation, useUpdateCommentMutation } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Params = {
  threadId?: string;
};

export default ({ threadId }: Params) => {
  const t = useT();

  const [createComment] = useAddCommentMutation({
    refetchQueries: ["GetAsset", "GetAssets", "GetItems", "GetRequests"],
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      if (!threadId) return;
      const comment = await createComment({
        variables: {
          threadId,
          content,
        },
      });
      if (comment.errors || !comment.data?.addComment) {
        Notification.error({ message: t("Failed to create comment.") });
        return;
      }
      Notification.success({ message: t("Successfully created comment!") });
    },
    [createComment, threadId, t],
  );

  const [updateComment] = useUpdateCommentMutation({
    refetchQueries: ["GetAsset", "GetAssets", "GetItems", "GetRequests"],
  });

  const handleCommentUpdate = useCallback(
    async (commentId: string, content: string) => {
      if (!threadId) return;
      const comment = await updateComment({
        variables: {
          threadId,
          commentId,
          content
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
    refetchQueries: ["GetAsset", "GetAssets", "GetItems", "GetRequests"],
  });

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      if (!threadId) return;
      const comment = await deleteComment({
        variables: {
          threadId,
          commentId
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
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete
  };
};
