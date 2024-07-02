import { Key, useCallback, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { fromGraphQLComment } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  useGetRequestsQuery,
  useDeleteRequestMutation,
  Comment as GQLComment,
  RequestState as GQLRequestState,
  useGetMeQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace } from "@reearth-cms/state";

export type RequestState = "DRAFT" | "WAITING" | "CLOSED" | "APPROVED";

export default () => {
  const t = useT();

  const navigate = useNavigate();
  const location: {
    state?: {
      searchTerm?: string;
      page: number;
      pageSize: number;
    } | null;
  } = useLocation();
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedRequestId, setselectedRequestId] = useState<string>();
  const [page, setPage] = useState(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState(location.state?.pageSize ?? 10);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm ?? "");

  const [requestState, setRequestState] = useState<RequestState[]>(["WAITING"]);
  const [createdByMe, setCreatedByMe] = useState(false);
  const [reviewedByMe, setReviewedByMe] = useState(false);

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data: userData } = useGetMeQuery();

  const {
    data: rawRequests,
    refetch,
    loading,
  } = useGetRequestsQuery({
    fetchPolicy: "no-cache",
    variables: {
      projectId: projectId ?? "",
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
      sort: { key: "createdAt", reverted: true },
      key: searchTerm,
      state: requestState as GQLRequestState[],
      reviewer: reviewedByMe && userData?.me?.id ? userData?.me?.id : undefined,
      createdBy: createdByMe && userData?.me?.id ? userData?.me?.id : undefined,
    },
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
  });

  const handleRequestsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const requests: Request[] = useMemo(() => {
    if (!rawRequests?.requests.nodes) return [];
    const requests: Request[] = rawRequests?.requests.nodes
      .map(r => {
        if (!r) return;
        const request: Request = {
          id: r.id,
          title: r.title,
          description: r.description ?? "",
          state: r.state,
          threadId: r.threadId,
          comments: r.thread?.comments.map(c => fromGraphQLComment(c as GQLComment)) ?? [],
          reviewers: r.reviewers,
          createdBy: r.createdBy ?? undefined,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          approvedAt: r.approvedAt ?? undefined,
          closedAt: r.closedAt ?? undefined,
          items: [],
        };
        return request;
      })
      .filter((r): r is Request => r !== undefined);
    return requests;
  }, [rawRequests?.requests.nodes]);

  const handleRequestSelect = useCallback(
    (id: string) => {
      setselectedRequestId(id);
      collapseCommentsPanel(false);
    },
    [setselectedRequestId],
  );

  const handleNavigateToRequest = useCallback(
    (requestId: string) => {
      if (!projectId || !currentWorkspace?.id || !requestId) return;
      navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/request/${requestId}`, {
        state: { searchTerm, page, pageSize },
      });
    },
    [currentWorkspace?.id, navigate, page, pageSize, projectId, searchTerm],
  );

  const [deleteRequestMutation, { loading: deleteLoading }] = useDeleteRequestMutation();
  const handleRequestDelete = useCallback(
    async (requestsId: string[]) => {
      if (!projectId) return;
      const result = await deleteRequestMutation({
        variables: { projectId, requestsId },
        refetchQueries: ["GetRequests"],
      });
      if (result.errors) {
        Notification.error({ message: t("Failed to delete one or more requests.") });
      }
      if (result) {
        Notification.success({ message: t("One or more requests were successfully closed!") });
        setSelection({ selectedRowKeys: [] });
      }
    },
    [t, projectId, deleteRequestMutation],
  );

  const selectedRequest = useMemo(
    () => requests.find(request => request.id === selectedRequestId),
    [requests, selectedRequestId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleRequestTableChange = useCallback(
    (
      page: number,
      pageSize: number,
      requestState?: RequestState[] | null,
      createdByMe?: boolean,
      reviewedByMe?: boolean,
    ) => {
      setPage(page);
      setPageSize(pageSize);
      setRequestState(requestState ?? ["WAITING", "DRAFT", "CLOSED", "APPROVED"]);
      setCreatedByMe(createdByMe ?? false);
      setReviewedByMe(reviewedByMe ?? false);
    },
    [],
  );

  return {
    requests,
    loading: loading,
    collapsedCommentsPanel,
    collapseCommentsPanel,
    selectedRequest,
    selection,
    handleNavigateToRequest,
    setSelection,
    handleRequestSelect,
    handleRequestsReload,
    deleteLoading,
    handleRequestDelete,
    searchTerm,
    handleSearchTerm,
    reviewedByMe,
    createdByMe,
    requestState,
    totalCount: rawRequests?.requests.totalCount ?? 0,
    page,
    pageSize,
    handleRequestTableChange,
  };
};
