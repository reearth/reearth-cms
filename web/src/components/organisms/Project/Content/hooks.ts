import { useCallback, useMemo, useState } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  useSearchItemQuery,
  useUpdateRequestMutation,
  RequestState as GQLRequestState,
  Request as GQLRequest,
  useGetRequestsQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useModel, useProject, useWorkspace } from "@reearth-cms/state";

import { convertRequest } from "../Request/convertRequest";

export default () => {
  const [currentModel] = useModel();
  const [currentWorkspace] = useWorkspace();
  const [currentProject] = useProject();
  const [addItemToRequestModalShown, setAddItemToRequestModalShown] = useState(false);
  const t = useT();
  const {
    data: itemsData,
    refetch,
    loading: itemsDataLoading,
  } = useSearchItemQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      query: { project: currentProject?.id as string, schema: currentModel?.schema.id ?? "" },
      pagination: { first: 1000 },
    },
    skip: !currentModel?.schema.id,
  });

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const { data: requestData } = useGetRequestsQuery({
    variables: {
      projectId: currentProject?.id ?? "",
      pagination: { first: 100 },
    },
    skip: !currentProject?.id,
  });

  const requests: Request[] = useMemo(
    () =>
      (requestData?.requests.nodes
        .map(request => request as GQLRequest)
        .map(convertRequest)
        .filter(request => !!request && request.state === "WAITING") as Request[]) ?? [],
    [requestData?.requests.nodes],
  );

  const [updateRequest] = useUpdateRequestMutation();

  const handleAddItemToRequest = useCallback(
    async (request: Request, itemIds: string[]) => {
      const item = await updateRequest({
        variables: {
          requestId: request.id,
          description: request.description,
          items: [
            ...request.items.map(item => ({ itemId: item.id })),
            ...itemIds.map(itemId => ({ itemId })),
          ],
          reviewersId: request.reviewers.map(reviewer => reviewer.id),
          title: request.title,
          state: request.state as GQLRequestState,
        },
      });
      if (item.errors || !item.data?.updateRequest) {
        Notification.error({ message: t("Failed to update request.") });
        return;
      }

      Notification.success({ message: t("Successfully updated Request!") });
    },
    [updateRequest, t],
  );

  const handleAddItemToRequestModalClose = useCallback(
    () => setAddItemToRequestModalShown(false),
    [],
  );

  const handleAddItemToRequestModalOpen = useCallback(
    () => setAddItemToRequestModalShown(true),
    [],
  );

  return {
    itemsDataLoading,
    currentWorkspace,
    currentModel,
    currentProject,
    itemsData,
    requests,
    addItemToRequestModalShown,
    handleItemsReload,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
  };
};
