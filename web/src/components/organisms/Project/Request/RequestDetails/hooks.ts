import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import { fromGraphQLRequest } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useDeleteRequestMutation,
  useApproveRequestMutation,
  useAddCommentMutation,
  useGetMeQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetRequestQuery,
  Request as GQLRequest,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const { requestId } = useParams();
  const location = useLocation();

  const { data: userData } = useGetMeQuery();
  const { data: rawRequest, loading } = useGetRequestQuery({
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

  const myRole = useMemo(
    () =>
      currentWorkspace?.members?.find((m): m is UserMember => "userId" in m && m.userId === me?.id)
        ?.role,
    [currentWorkspace?.members, me?.id],
  );

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const currentRequest: Request | undefined = useMemo(() => {
    if (!rawRequest?.node) return;
    return fromGraphQLRequest(rawRequest.node as GQLRequest);
  }, [rawRequest]);

  const isCloseActionEnabled: boolean = useMemo(
    () =>
      currentRequest?.state !== "CLOSED" &&
      currentRequest?.state !== "APPROVED" &&
      !!currentRequest?.reviewers.find(reviewer => reviewer.id === me?.id) &&
      myRole !== "READER" &&
      myRole !== "WRITER",
    [currentRequest?.reviewers, currentRequest?.state, me?.id, myRole],
  );

  const isApproveActionEnabled: boolean = useMemo(
    () =>
      currentRequest?.state === "WAITING" &&
      !!currentRequest?.reviewers.find(reviewer => reviewer.id === me?.id) &&
      myRole !== "READER" &&
      myRole !== "WRITER",
    [currentRequest?.reviewers, currentRequest?.state, me?.id, myRole],
  );

  const [deleteRequestMutation, { loading: deleteLoading }] = useDeleteRequestMutation();
  const handleRequestDelete = useCallback(
    (requestsId: string[]) =>
      (async () => {
        if (!projectId) return;
        const result = await deleteRequestMutation({
          variables: { projectId, requestsId },
          refetchQueries: ["GetRequests", "GetRequest"],
        });
        if (result.errors) {
          Notification.error({ message: t("Failed to delete one or more requests.") });
        }
        if (result) {
          Notification.success({ message: t("One or more requests were successfully closed!") });
          navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/request`);
        }
      })(),
    [t, projectId, currentWorkspace?.id, navigate, deleteRequestMutation],
  );

  const [approveRequestMutation, { loading: approveLoading }] = useApproveRequestMutation();
  const handleRequestApprove = useCallback(
    (requestId: string) =>
      (async () => {
        const result = await approveRequestMutation({
          variables: { requestId },
          refetchQueries: ["GetRequests", "GetRequest"],
        });
        if (result.errors) {
          Notification.error({ message: t("Failed to approve request.") });
        }
        if (result) {
          Notification.success({ message: t("Successfully approved request!") });
          navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/request`);
        }
      })(),
    [currentWorkspace?.id, projectId, navigate, t, approveRequestMutation],
  );

  const [createComment] = useAddCommentMutation({
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      if (!currentRequest?.threadId) return;
      const comment = await createComment({
        variables: {
          threadId: currentRequest.threadId,
          content,
        },
      });
      if (comment.errors || !comment.data?.addComment) {
        Notification.error({ message: t("Failed to create comment.") });
        return;
      }
      Notification.success({ message: t("Successfully created comment!") });
    },
    [createComment, currentRequest?.threadId, t],
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
    isCloseActionEnabled,
    loading,
    deleteLoading,
    approveLoading,
    isApproveActionEnabled,
    currentRequest,
    handleRequestDelete,
    handleRequestApprove,
    handleCommentCreate,
    handleCommentUpdate,
    handleCommentDelete,
    handleNavigateToRequestsList,
    handleNavigateToItemEdit,
  };
};
