import { NetworkStatus } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { Request, RequestUpdatePayload } from "@reearth-cms/components/molecules/Request/types";
import { fromGraphQLRequest } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  AddCommentDocument,
  DeleteCommentDocument,
  UpdateCommentDocument,
} from "@reearth-cms/gql/__generated__/comment.generated";
import {
  Request as GQLRequest,
  RequestState as GQLRequestState,
  ResourceType as GQLResourceType,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  ApproveRequestDocument,
  DeleteRequestDocument,
  GetRequestDocument,
  UpdateRequestDocument,
} from "@reearth-cms/gql/__generated__/requests.generated";
import { CreateThreadWithCommentDocument } from "@reearth-cms/gql/__generated__/thread.generated";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
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

  const { data: userData } = useQuery(GetMeDocument);
  const { data: rawRequest, networkStatus } = useQuery(GetRequestDocument, {
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

  const [updateRequestMutation, { loading: updateRequestLoading }] =
    useMutation(UpdateRequestDocument);

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
      if (request.error || !request.data?.updateRequest) {
        Notification.error({ title: t("Failed to update request.") });
        return;
      }
      Notification.success({ title: t("Successfully updated request!") });
    },
    [updateRequestMutation, t],
  );

  const [deleteRequestMutation, { loading: deleteLoading }] = useMutation(DeleteRequestDocument);
  const handleRequestDelete = useCallback(
    async (requestsId: string[]) => {
      if (!projectId) return;
      const result = await deleteRequestMutation({
        variables: { projectId, requestsId },
        refetchQueries: ["GetRequest"],
      });
      if (result.error) {
        Notification.error({ title: t("Failed to delete one or more requests.") });
      }
      if (result) {
        Notification.success({ title: t("One or more requests were successfully closed!") });
      }
    },
    [t, projectId, deleteRequestMutation],
  );

  const [approveRequestMutation, { loading: approveLoading }] = useMutation(ApproveRequestDocument);
  const handleRequestApprove = useCallback(
    async (requestId: string) => {
      const result = await approveRequestMutation({
        variables: { requestId },
      });
      if (result.error) {
        Notification.error({ title: t("Failed to approve request.") });
      }
      if (result) {
        Notification.success({ title: t("Successfully approved request!") });
      }
    },
    [t, approveRequestMutation],
  );

  const [createComment] = useMutation(AddCommentDocument, {
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const [createThreadWithComment] = useMutation(CreateThreadWithCommentDocument, {
    refetchQueries: ["GetRequests", "GetRequest"],
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      try {
        if (!currentRequest?.threadId) {
          const { data, error } = await createThreadWithComment({
            variables: {
              workspaceId: currentWorkspace?.id ?? "",
              resourceId: currentRequest?.id ?? "",
              resourceType: GQLResourceType.Request,
              content,
            },
          });

          if (error || !data?.createThreadWithComment?.thread?.id) {
            Notification.error({ title: t("Failed to create thread.") });
            return;
          }
        } else {
          const { data: commentData, error: commentError } = await createComment({
            variables: { threadId: currentRequest?.threadId, content },
          });

          if (commentError || !commentData?.addComment) {
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

  const [updateComment] = useMutation(UpdateCommentDocument, {
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
      if (comment.error || !comment.data?.updateComment) {
        Notification.error({ title: t("Failed to update comment.") });
        return;
      }
      Notification.success({ title: t("Successfully updated comment!") });
    },
    [updateComment, currentRequest?.threadId, t],
  );

  const [deleteComment] = useMutation(DeleteCommentDocument, {
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
      if (comment.error || !comment.data?.deleteComment) {
        Notification.error({ title: t("Failed to delete comment.") });
        return;
      }
      Notification.success({ title: t("Successfully deleted comment!") });
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
