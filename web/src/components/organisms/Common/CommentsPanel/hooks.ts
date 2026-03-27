import { useMutation } from "@apollo/client/react";
import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import {
  RefetchQueries,
  ResourceType,
} from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import {
  AddCommentDocument,
  DeleteCommentDocument,
  UpdateCommentDocument,
} from "@reearth-cms/gql/__generated__/comment.generated";
import { ResourceType as GQLResourceType } from "@reearth-cms/gql/__generated__/graphql.generated";
import { CreateThreadWithCommentDocument } from "@reearth-cms/gql/__generated__/thread.generated";
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

  const [createThreadWithComment] = useMutation(CreateThreadWithCommentDocument, {
    refetchQueries,
  });

  const [createComment] = useMutation(AddCommentDocument, {
    refetchQueries,
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      try {
        if (!threadId) {
          const { data, error } = await createThreadWithComment({
            variables: {
              workspaceId: currentWorkspaceId ?? "",
              resourceId: resourceId ?? "",
              resourceType: resourceType as GQLResourceType,
              content,
            },
          });

          if (error || !data?.createThreadWithComment?.thread?.id) {
            Notification.error({ title: t("Failed to create thread.") });
            return;
          }
        } else {
          const { data: commentData, error: commentErrors } = await createComment({
            variables: { threadId, content },
          });

          if (commentErrors || !commentData?.addComment) {
            Notification.error({ title: t("Failed to create comment.") });
            return;
          }
        }
        Notification.success({ title: t("Successfully created comment!") });
      } catch (error) {
        Notification.error({ title: t("An unexpected error occurred.") });
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

  const [updateComment] = useMutation(UpdateCommentDocument, {
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
      if (comment.error || !comment.data?.updateComment) {
        Notification.error({ title: t("Failed to update comment.") });
        return;
      }
      Notification.success({ title: t("Successfully updated comment!") });
    },
    [updateComment, threadId, t],
  );

  const [deleteComment] = useMutation(DeleteCommentDocument, {
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
      if (comment.error || !comment.data?.deleteComment) {
        Notification.error({ title: t("Failed to delete comment.") });
        return;
      }
      Notification.success({ title: t("Successfully deleted comment!") });
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
