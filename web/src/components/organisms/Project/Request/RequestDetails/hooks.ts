import { NetworkStatus } from "@apollo/client";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { fromGraphQLRequest } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useUpdateRequestMutation,
  useDeleteRequestMutation,
  useApproveRequestMutation,
  useAddCommentMutation,
  useGetMeQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetRequestQuery,
  useCreateThreadWithCommentMutation,
  Request as GQLRequest,
  RequestState as GQLRequestState,
  ResourceType as GQLResourceType,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace, useUserRights } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const { requestId } = useParams();
  const location = useLocation();

  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [userRights] = useUserRights();
  const hasCommentCreateRight = useMemo(
    () => !!userRights?.comment.create,
    [userRights?.comment.create],
  );
  const hasCommentUpdateRight = useMemo(
    () => userRights?.comment.update !== undefined && userRights.comment.update,
    [userRights?.comment.update],
  );
  const hasCommentDeleteRight = useMemo(
    () => userRights?.comment.delete !== undefined && userRights.comment.delete,
    [userRights?.comment.delete],
  );

  const { data: userData } = useGetMeQuery();
  const { data: rawRequest, networkStatus } = useGetRequestQuery({
    variables: { requestId: requestId ?? "" },
    skip: !requestId,
    fetchPolicy: "cache-and-network",
  });

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

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const currentRequest: Request | undefined = useMemo(() => {
    if (!rawRequest?.node) return;
    return fromGraphQLRequest(rawRequest.node as GQLRequest);
  }, [rawRequest]);

  const isCloseActionEnabled = useMemo(
    () =>
      (currentRequest?.state === "WAITING" || currentRequest?.state === "DRAFT") &&
      (userRights?.request.close === null
        ? currentRequest.createdBy?.id === me?.id
        : !!userRights?.request.close),
    [currentRequest?.createdBy?.id, currentRequest?.state, me?.id, userRights?.request.close],
  );

  const isReopenActionEnabled = useMemo(
    () => currentRequest?.state === "CLOSED" && !!userRights?.request.close,
    [currentRequest?.state, userRights?.request.close],
  );

  const isApproveActionEnabled = useMemo(
    () =>
      currentRequest?.state === "WAITING" &&
      !!userRights?.request.approve &&
      currentRequest?.reviewers.some(reviewer => reviewer.id === me?.id),
    [currentRequest?.reviewers, currentRequest?.state, me?.id, userRights?.request.approve],
  );

  const isAssignActionEnabled = useMemo(
    () =>
      (currentRequest?.state === "WAITING" || currentRequest?.state === "DRAFT") &&
      (userRights?.request.update === null
        ? currentRequest.createdBy?.id === me?.id
        : !!userRights?.request.update),
    [currentRequest?.createdBy?.id, currentRequest?.state, me?.id, userRights?.request.update],
  );

  const [updateRequestMutation, { loading: updateRequestLoading }] = useUpdateRequestMutation();

  const handleRequestUpdate = useCallback(
    async (data: RequestUpdatePayload) => {
      if (!data.requestId) return;
      const request = await updateRequestMutation({
        variables: {
          requestId: data.requestId,
          title: data.title,
          description: data.description,
          state: data.state as GQLRequestState,
          reviewersId: data.reviewersId,
          items: data.items,
        },
      });
      if (request.errors || !request.data?.updateRequest) {
        Notification.error({ message: t("Failed to update request.") });
        return;
      }
      Notification.success({ message: t("Successfully updated request!") });
    },
    [updateRequestMutation, t],
  );

  const [deleteRequestMutation, { loading: deleteLoading }] = useDeleteRequestMutation();
  const handleRequestDelete = useCallback(
    async (requestsId: string[]) => {
      if (!projectId) return;
      const result = await deleteRequestMutation({
        variables: { projectId, requestsId },
        refetchQueries: ["GetRequest"],
      });
      if (result.errors) {
        Notification.error({ message: t("Failed to delete one or more requests.") });
      }
      if (result) {
        Notification.success({ message: t("One or more requests were successfully closed!") });
      }
    },
    [t, projectId, deleteRequestMutation],
  );

  const [approveRequestMutation, { loading: approveLoading }] = useApproveRequestMutation();
  const handleRequestApprove = useCallback(
    async (requestId: string) => {
      const result = await approveRequestMutation({
        variables: { requestId },
      });
      if (result.errors) {
        Notification.error({ message: t("Failed to approve request.") });
      }
      if (result) {
        Notification.success({ message: t("Successfully approved request!") });
      }
    },
    [t, approveRequestMutation],
  );

  const [createComment] = useAddCommentMutation({
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const [createThreadWithComment] = useCreateThreadWithCommentMutation({
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      try {
        if (!currentRequest?.threadId) {
          const { data, errors } = await createThreadWithComment({
            variables: {
              workspaceId: currentWorkspace?.id ?? "",
              resourceId: currentRequest?.id ?? "",
              resourceType: GQLResourceType.Request,
              content,
            },
          });

          if (errors || !data?.createThreadWithComment?.thread?.id) {
            Notification.error({ message: t("Failed to create thread.") });
            return;
          }
        } else {
          const { data: commentData, errors: commentErrors } = await createComment({
            variables: { threadId: currentRequest?.threadId, content },
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
      createComment,
      createThreadWithComment,
      currentRequest?.id,
      currentRequest?.threadId,
      currentWorkspace?.id,
      t,
    ],
  );

  const handleNavigateToRequestsList = useCallback(() => {
    navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/request`, {
      state: location.state,
    });
  }, [navigate, currentWorkspace?.id, projectId, location.state]);

  const handleNavigateToItemEdit = useCallback(
    (modelId: string, itemId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}/details/${itemId}`,
      );
    },
    [currentProject?.id, currentWorkspace?.id, navigate],
  );

  const [updateComment] = useUpdateCommentMutation({
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const handleCommentUpdate = useCallback(
    async (commentId: string, content: string) => {
      if (!currentRequest?.threadId) return;
      const comment = await updateComment({
        variables: {
          threadId: currentRequest.threadId,
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
    [updateComment, currentRequest?.threadId, t],
  );

  const [deleteComment] = useDeleteCommentMutation({
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      if (!currentRequest?.threadId) return;
      const comment = await deleteComment({
        variables: {
          threadId: currentRequest.threadId,
          commentId,
        },
      });
      if (comment.errors || !comment.data?.deleteComment) {
        Notification.error({ message: t("Failed to delete comment.") });
        return;
      }
      Notification.success({ message: t("Successfully deleted comment!") });
    },
    [deleteComment, currentRequest?.threadId, t],
  );

  return {
    me,
    hasCommentCreateRight,
    hasCommentUpdateRight,
    hasCommentDeleteRight,
    isCloseActionEnabled,
    isReopenActionEnabled,
    isApproveActionEnabled,
    isAssignActionEnabled,
    loading: networkStatus === NetworkStatus.loading,
    updateRequestLoading,
    deleteLoading,
    approveLoading,
    currentRequest,
    handleRequestUpdate,
    handleRequestDelete,
    handleRequestApprove,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
    handleNavigateToRequestsList,
    handleNavigateToItemEdit,
  };
};
