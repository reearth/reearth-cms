import { Key, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { convertRequest } from "@reearth-cms/components/organisms/Project/Request/convertRequest";
import {
  useGetRequestsQuery,
  useDeleteRequestMutation,
  Request as GQLRequest,
  RequestState as GQLRequestState,
  useGetMeQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace } from "@reearth-cms/state";

export type RequestState = "DRAFT" | "WAITING" | "CLOSED" | "APPROVED";

export default () => {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>();
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedRequestId, setselectedRequestId] = useState<string>();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [requestState, setRequestState] = useState<RequestState[]>(["WAITING"]);
  const [createdByMe, setCreatedByMe] = useState<boolean>(false);
  const [reviewedByMe, setReviewedByMe] = useState<boolean>(false);

  useEffect(() => {
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    setPage(pageParam ? +pageParam : 1);
    setPageSize(pageSizeParam ? +pageSizeParam : 10);
  }, [searchParams]);

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data: userData } = useGetMeQuery();

  const { data, refetch, loading } = useGetRequestsQuery({
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
    skip: !projectId,
  });

  const handleRequestsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const requests: Request[] = useMemo(
    () =>
      (data?.requests.nodes
        .map(request => request as GQLRequest)
        .map(convertRequest)
        .filter(request => !!request) as Request[]) ?? [],
    [data?.requests.nodes],
  );

  const handleRequestSelect = useCallback(
    (id: string) => {
      setselectedRequestId(id);
      collapseCommentsPanel(false);
    },
    [setselectedRequestId],
  );

  const handleNavigateToRequest = useCallback(
    (request: Request) => {
      navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/request/${request.id}`);
    },
    [currentWorkspace?.id, navigate, projectId],
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
          Notification.success({ message: t("One or more requests were successfully closed!") });
          setSelection({ selectedRowKeys: [] });
        }
      })(),
    [t, projectId, deleteRequestMutation],
  );

  const selectedRequest = useMemo(
    () => requests.find(request => request.id === selectedRequestId),
    [requests, selectedRequestId],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  const handleRequestTableChange = useCallback(
    (
      page: number,
      pageSize: number,
      requestState?: RequestState[] | null,
      createdByMe?: boolean,
      reviewedByMe?: boolean,
    ) => {
      setSearchParams(`?page=${page}&pageSize=${pageSize}`);
      setRequestState(requestState ?? ["APPROVED", "CLOSED", "DRAFT", "WAITING"]);
      setCreatedByMe(createdByMe ?? false);
      setReviewedByMe(reviewedByMe ?? false);
    },
    [setSearchParams],
  );

  return {
    requests,
    loading,
    collapsedCommentsPanel,
    collapseCommentsPanel,
    selectedRequests,
    selectedRequest,
    selection,
    handleNavigateToRequest,
    setSelection,
    handleRequestSelect,
    handleRequestsReload,
    handleRequestDelete,
    handleSearchTerm,
    totalCount: data?.requests.totalCount ?? 0,
    page,
    pageSize,
    handleRequestTableChange,
  };
};
