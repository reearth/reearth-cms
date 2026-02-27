import { useMutation, useQuery } from "@apollo/client/react";
import { Key, useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ColumnsState } from "@reearth-cms/components/atoms/ProTable";
import { Request, RequestState } from "@reearth-cms/components/molecules/Request/types";
import { fromGraphQLComment } from "@reearth-cms/components/organisms/DataConverters/content";
import {
  Comment as GQLComment,
  RequestState as GQLRequestState,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  DeleteRequestDocument,
  GetRequestsDocument,
} from "@reearth-cms/gql/__generated__/requests.generated";
import { useT } from "@reearth-cms/i18n";
import { useProject, useUserId, useUserRights, useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();

  const navigate = useNavigate();
  const location: {
    state?: {
      columns: Record<string, ColumnsState>;
      createdByMe: boolean;
      page: number;
      pageSize: number;
      requestState: RequestState[];
      reviewedByMe: boolean;
      searchTerm?: string;
    } | null;
  } = useLocation();

  const [currentProject] = useProject();
  const projectId = useMemo(() => currentProject?.id, [currentProject]);
  const [currentWorkspace] = useWorkspace();
  const [userId] = useUserId();
  const [userRights] = useUserRights();
  const [hasCloseRight, setHasCloseRight] = useState(false);

  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });

  const handleSelect = useCallback(
    (selectedRowKeys: Key[], selectedRows: Request[]) => {
      setSelection({
        ...selection,
        selectedRowKeys,
      });
      const newCloseRight =
        userRights?.request.close === null
          ? selectedRows.every(row => row.createdBy?.id === userId)
          : !!userRights?.request.close;
      setHasCloseRight(newCloseRight);
    },
    [selection, userId, userRights?.request.close],
  );

  const [selectedRequestId, setSelectedRequestId] = useState<string>();
  const [page, setPage] = useState(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState(location.state?.pageSize ?? 10);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm ?? "");

  const [requestState, setRequestState] = useState<RequestState[]>(
    location.state?.requestState ?? ["WAITING"],
  );
  const [createdByMe, setCreatedByMe] = useState(location.state?.createdByMe ?? false);
  const [reviewedByMe, setReviewedByMe] = useState(location.state?.reviewedByMe ?? false);

  const [columns, setColumns] = useState<Record<string, ColumnsState>>(
    location.state?.columns ?? {},
  );

  const {
    data: rawRequests,
    loading,
    refetch,
  } = useQuery(GetRequestsDocument, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    skip: !projectId,
    variables: {
      createdBy: createdByMe && userId ? userId : undefined,
      key: searchTerm,
      pagination: { first: pageSize, offset: (page - 1) * pageSize },
      projectId: projectId ?? "",
      reviewer: reviewedByMe && userId ? userId : undefined,
      sort: { key: "createdAt", reverted: true },
      state: requestState.length === 0 ? undefined : (requestState as GQLRequestState[]),
    },
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
          approvedAt: r.approvedAt ?? undefined,
          closedAt: r.closedAt ?? undefined,
          comments: r.thread?.comments.map(c => fromGraphQLComment(c as GQLComment)) ?? [],
          createdAt: r.createdAt,
          createdBy: r.createdBy ?? undefined,
          description: r.description ?? "",
          id: r.id,
          items: [],
          reviewers: r.reviewers,
          state: r.state,
          threadId: r.threadId ?? "",
          title: r.title,
          updatedAt: r.updatedAt,
        };
        return request;
      })
      .filter((r): r is Request => r !== undefined);
    return requests;
  }, [rawRequests?.requests.nodes]);

  const handleRequestSelect = useCallback(
    (id: string) => {
      setSelectedRequestId(id);
      collapseCommentsPanel(false);
    },
    [setSelectedRequestId],
  );

  const handleNavigateToRequest = useCallback(
    (requestId: string) => {
      if (!projectId || !currentWorkspace?.id || !requestId) return;
      navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/request/${requestId}`, {
        state: { columns, createdByMe, page, pageSize, requestState, reviewedByMe, searchTerm },
      });
    },
    [
      navigate,
      currentWorkspace?.id,
      projectId,
      searchTerm,
      requestState,
      createdByMe,
      reviewedByMe,
      columns,
      page,
      pageSize,
    ],
  );

  const [deleteRequestMutation, { loading: deleteLoading }] = useMutation(DeleteRequestDocument);
  const handleRequestDelete = useCallback(
    async (requestsId: string[]) => {
      if (!projectId) return;
      const result = await deleteRequestMutation({
        refetchQueries: ["GetRequests"],
        variables: { projectId, requestsId },
      });
      if (result.error) {
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
      requestState?: null | RequestState[],
      createdByMe?: boolean,
      reviewedByMe?: boolean,
    ) => {
      setPage(page);
      setPageSize(pageSize);
      setRequestState(requestState ?? []);
      setCreatedByMe(createdByMe ?? false);
      setReviewedByMe(reviewedByMe ?? false);
    },
    [],
  );

  const handleColumnsChange = useCallback((cols: Record<string, ColumnsState>) => {
    delete cols.EDIT_ICON;
    delete cols.commentsCount;
    setColumns(cols);
  }, []);

  return {
    collapseCommentsPanel,
    collapsedCommentsPanel,
    columns,
    createdByMe,
    deleteLoading,
    handleColumnsChange,
    handleNavigateToRequest,
    handleRequestDelete,
    handleRequestSelect,
    handleRequestsReload,
    handleRequestTableChange,
    handleSearchTerm,
    handleSelect,
    hasCloseRight,
    loading,
    page,
    pageSize,
    requests,
    requestState,
    reviewedByMe,
    searchTerm,
    selectedRequest,
    selection,
    totalCount: rawRequests?.requests.totalCount ?? 0,
  };
};
