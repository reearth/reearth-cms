import { useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { RefetchQueries,ResourceType } from "@reearth-cms/components/molecules/Common/CommentsPanel/types";
import {
  ResourceType as GQLResourceType,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetMeQuery,
  useUpdateCommentMutation,
  useCreateThreadMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspaceId, useUserRights } from "@reearth-cms/state";

type Params = {
  resourceId?: string;
  resourceType?: ResourceType;
  threadId?: string;
  refetchQueries: RefetchQueries;
};

export default ({ resourceType, resourceId, threadId, refetchQueries }: Params) => {
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

  const { data: userData } = useGetMeQuery();

  const me: User | undefined = useMemo(() => {
    return userData?.me
      ? {
          id: userData.me.id,
          name: userData.me.name,
          lang: userData.me.lang,
          email: userData.me.email,
        }
      : undefined;
  }, [userData]);

  const [createThread] = useCreateThreadMutation({
    refetchQueries,
  });

  const [createComment] = useAddCommentMutation({
    refetchQueries,
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      let id = threadId;
      if (!threadId) {
        const thread = await createThread({
          variables: {
            workspaceId: currentWorkspaceId ?? "",
            resourceId: resourceId,
            resourceType: resourceType as GQLResourceType,
          },
        });
        if (thread.errors || !thread.data?.createThread?.thread) {
          Notification.error({ message: t("Failed to create thread.") });
        }
        id = thread.data?.createThread?.thread?.id;
      }
      const comment = await createComment({
        variables: {
          threadId: id ?? "",
          content,
        },
      });
      if (comment.errors || !comment.data?.addComment) {
        Notification.error({ message: t("Failed to create comment.") });
        return;
      }
      Notification.success({ message: t("Successfully created comment!") });
    },
    [threadId, createComment, t, createThread, currentWorkspaceId, resourceId, resourceType],
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
    me,
    hasCreateRight,
    hasUpdateRight,
    hasDeleteRight,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
  };
};
