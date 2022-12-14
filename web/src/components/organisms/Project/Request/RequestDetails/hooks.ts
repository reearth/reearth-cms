import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { convertRequest } from "@reearth-cms/components/organisms/Project/Request/convertRequest";
import {
  useGetRequestsQuery,
  Request as GQLRequest,
  useDeleteRequestMutation,
  useApproveRequestMutation,
  useAddCommentMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const [currentProject] = useProject();
  const { requestId } = useParams();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data } = useGetRequestsQuery({
    variables: {
      projectId: projectId ?? "",
    },
    skip: !projectId,
  });

  const currentRequest: Request | undefined = useMemo(
    () =>
      convertRequest(data?.requests.nodes.find(request => request?.id === requestId) as GQLRequest),
    [requestId, data?.requests.nodes],
  );

  const [deleteRequestMutation] = useDeleteRequestMutation();
  const handleRequestDelete = useCallback(
    (requestsId: string[]) =>
      (async () => {
        if (!projectId) return;
        const result = await deleteRequestMutation({
          variables: { projectId, requestsId },
          refetchQueries: ["GetRequests"],
        });
        if (result.errors) {
          Notification.error({ message: t("Failed to delete one or more requests.") });
        }
        if (result) {
          Notification.success({ message: t("One or more requests were successfully deleted!") });
        }
      })(),
    [t, projectId, deleteRequestMutation],
  );

  const [approveRequestMutation] = useApproveRequestMutation();
  const handleRequestApprove = useCallback(
    (requestId: string) =>
      (async () => {
        const result = await approveRequestMutation({
          variables: { requestId },
          refetchQueries: ["GetRequests"],
        });
        if (result.errors) {
          Notification.error({ message: t("Failed to approve request.") });
        }
        if (result) {
          Notification.success({ message: t("Successfully approved request!") });
        }
      })(),
    [approveRequestMutation, t],
  );

  const [createComment] = useAddCommentMutation({
    refetchQueries: ["GetRequests"],
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

  return {
    currentRequest,
    handleRequestDelete,
    handleRequestApprove,
    handleCommentCreate,
  };
};
