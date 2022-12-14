import { Key, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { convertRequest } from "@reearth-cms/components/organisms/Project/Request/convertRequest";
import {
  useGetRequestsQuery,
  useDeleteRequestMutation,
  Request as GQLRequest,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useProject, useWorkspace } from "@reearth-cms/state";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const [currentProject] = useProject();
  const [currentWorkspace] = useWorkspace();
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedRequests, selectRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>();
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });
  const [selectedRequestId, setselectedRequestId] = useState<string>();

  const projectId = useMemo(() => currentProject?.id, [currentProject]);

  const { data, refetch, loading } = useGetRequestsQuery({
    variables: {
      projectId: projectId ?? "",
      key: searchTerm,
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

  const handleNavigateToRequest = (request: Request) => {
    navigate(`/workspace/${currentWorkspace?.id}/project/${projectId}/asset/${request.id}`);
  };

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
          selectRequests([]);
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
  };
};
