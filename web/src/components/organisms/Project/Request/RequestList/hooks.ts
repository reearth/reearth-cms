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

  const pageParam = useMemo(() => searchParams.get("page"), [searchParams]);
  const pageSizeParam = useMemo(() => searchParams.get("pageSize"), [searchParams]);
  const searchTermParam = useMemo(() => searchParams.get("searchTerm"), [searchParams]);
  const stateParam = useMemo(() => searchParams.get("requestState"), [searchParams]);
  const createdByMeParam = useMemo(() => searchParams.get("createdByMe"), [searchParams]);
  const reviewedByMeParam = useMemo(() => searchParams.get("reviewedByMe"), [searchParams]);

  const navigate = useNavigate();
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedRequests] = useState<Request[]>([]);
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedRequestId, setselectedRequestId] = useState<string>();
  const [page, setPage] = useState<number>(pageParam ? +pageParam : 1);
  const [pageSize, setPageSize] = useState<number>(pageSizeParam ? +pageSizeParam : 10);
  const [searchTerm, setSearchTerm] = useState<string>(searchTermParam ?? "");

  const [requestState, setRequestState] = useState<RequestState[]>(
    stateParam ? JSON.parse(stateParam) : ["WAITING"],
  );
  const [createdByMe, setCreatedByMe] = useState<boolean>(
    createdByMeParam ? JSON.parse(createdByMeParam) : false,
  );
  const [reviewedByMe, setReviewedByMe] = useState<boolean>(
    reviewedByMeParam ? JSON.parse(reviewedByMeParam) : false,
  );

  useEffect(() => {
    setPage(pageParam ? +pageParam : 1);
    setPageSize(pageSizeParam ? +pageSizeParam : 10);
    setRequestState(stateParam ? JSON.parse(stateParam) : ["WAITING"]);
    setCreatedByMe(createdByMeParam ? JSON.parse(createdByMeParam) : false);
    setReviewedByMe(reviewedByMeParam ? JSON.parse(reviewedByMeParam) : false);
    setSearchTerm(searchTermParam ?? "");
  }, [pageParam, pageSizeParam, stateParam, createdByMeParam, reviewedByMeParam, searchTermParam]);

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

  const handleSearchTerm = useCallback(
    (term?: string) => {
      searchParams.set("searchTerm", term ?? "");
      setSearchParams(searchParams);
    },
    [setSearchParams, searchParams],
  );

  const handleRequestTableChange = useCallback(
    (
      page: number,
      pageSize: number,
      requestState?: RequestState[] | null,
      createdByMe?: boolean,
      reviewedByMe?: boolean,
    ) => {
      searchParams.set("page", page.toString());
      searchParams.set("pageSize", pageSize.toString());
      searchParams.set(
        "requestState",
        requestState
          ? JSON.stringify(requestState)
          : JSON.stringify(["WAITING", "DRAFT", "CLOSED", "APPROVED"]),
      );
      searchParams.set(
        "createdByMe",
        createdByMe ? JSON.stringify(createdByMe) : JSON.stringify(false),
      );
      searchParams.set(
        "reviewedByMe",
        reviewedByMe ? JSON.stringify(reviewedByMe) : JSON.stringify(false),
      );
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
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
    searchTerm,
    reviewedByMe,
    createdByMe,
    requestState,
    totalCount: data?.requests.totalCount ?? 0,
    page,
    pageSize,
    handleRequestTableChange,
  };
};
