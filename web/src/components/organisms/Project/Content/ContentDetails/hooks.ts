import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { Item } from "@reearth-cms/components/molecules/Content/types";
import {
  Request,
  RequestUpdatePayload,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { FieldType } from "@reearth-cms/components/molecules/Schema/types";
import { Member } from "@reearth-cms/components/molecules/Workspace/types";
import {
  Item as GQLItem,
  RequestState as GQLRequestState,
  Request as GQLRequest,
  SchemaFieldType,
  useCreateItemMutation,
  useCreateRequestMutation,
  useGetRequestsQuery,
  useUpdateItemMutation,
  useUpdateRequestMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";

import { convertRequest } from "../../Request/convertRequest";
import { convertItem } from "../convertItem";
import useContentHooks from "../hooks";

export default () => {
  const { currentModel, itemsData } = useContentHooks();
  const navigate = useNavigate();
  const { projectId, workspaceId, itemId } = useParams();
  const [currentWorkspace] = useWorkspace();
  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [requestModalShown, setRequestModalShown] = useState(false);
  const [addItemToRequestModalShown, setAddItemToRequestModalShown] = useState(false);
  const t = useT();

  const { data: requestData } = useGetRequestsQuery({
    variables: {
      projectId: projectId ?? "",
      first: 100,
    },
    skip: !projectId,
  });

  const requests: Request[] = useMemo(
    () =>
      (requestData?.requests.nodes
        .map(request => convertRequest(request as GQLRequest))
        .filter(request => !!request && request.state === "WAITING") as Request[]) ?? [],
    [requestData?.requests.nodes],
  );

  const handleNavigateToModel = useCallback(
    (modelId?: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/content/${modelId}`);
    },
    [navigate, workspaceId, projectId],
  );
  const [createNewItem, { loading: itemCreationLoading }] = useCreateItemMutation({
    refetchQueries: ["GetItems", "GetRequests"],
  });

  const handleItemCreate = useCallback(
    async (data: {
      schemaId: string;
      fields: { schemaFieldId: string; type: FieldType; value: string }[];
    }) => {
      if (!currentModel?.id) return;
      const item = await createNewItem({
        variables: {
          modelId: currentModel.id,
          schemaId: data.schemaId,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFieldType })),
        },
      });
      if (item.errors || !item.data?.createItem) {
        Notification.error({ message: t("Failed to create item.") });
        return;
      }
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${currentModel?.id}/details/${item.data.createItem.item.id}`,
      );
      Notification.success({ message: t("Successfully created Item!") });
    },
    [currentModel, projectId, workspaceId, createNewItem, navigate, t],
  );

  const [updateItem, { loading: itemUpdatingLoading }] = useUpdateItemMutation({
    refetchQueries: ["GetItems"],
  });

  const handleItemUpdate = useCallback(
    async (data: {
      itemId: string;
      fields: { schemaFieldId: string; type: FieldType; value: string }[];
    }) => {
      const item = await updateItem({
        variables: {
          itemId: data.itemId,
          fields: data.fields.map(field => ({ ...field, type: field.type as SchemaFieldType })),
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }

      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, t],
  );

  // handleAddItemToRequest

  const currentItem: Item | undefined = useMemo(
    () => convertItem(itemsData?.items.nodes.find(item => item?.id === itemId) as GQLItem),
    [itemId, itemsData?.items.nodes],
  );

  const initialFormValues: { [key: string]: any } = useMemo(() => {
    const initialValues: { [key: string]: any } = {};
    if (!currentItem) {
      currentModel?.schema.fields.forEach(field => {
        switch (field.type) {
          case "Select":
            initialValues[field.id] = field.typeProperty.selectDefaultValue;
            break;
          case "Integer":
            initialValues[field.id] = field.typeProperty.integerDefaultValue;
            break;
          case "Asset":
            initialValues[field.id] = field.typeProperty.assetDefaultValue;
            break;
          default:
            initialValues[field.id] = field.typeProperty.defaultValue;
            break;
        }
      });
    } else {
      currentItem?.fields?.forEach(field => {
        initialValues[field.schemaFieldId] = field.value;
      });
    }
    return initialValues;
  }, [currentItem, currentModel?.schema.fields]);

  const workspaceUserMembers = useMemo((): Member[] => {
    return (
      currentWorkspace?.members
        ?.map<Member | undefined>(member =>
          member.__typename === "WorkspaceUserMember" && member.user
            ? {
                userId: member.userId,
                user: member.user,
                role: member.role,
              }
            : undefined,
        )
        .filter(
          (user): user is Member => !!user && (user.role === "OWNER" || user.role === "MAINTAINER"),
        ) ?? []
    );
  }, [currentWorkspace]);

  const [updateRequest] = useUpdateRequestMutation();

  const handleAddItemToRequest = useCallback(
    async (request: Request) => {
      if (!currentItem) return;
      const item = await updateRequest({
        variables: {
          requestId: request.id,
          description: request.description,
          items: [...request.items.map(item => ({ itemId: item.id })), { itemId: currentItem.id }],
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
    [updateRequest, currentItem, t],
  );

  const [createRequestMutation] = useCreateRequestMutation();

  const handleRequestCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      state: RequestState;
      reviewersId: string[];
      items: { itemId: string }[];
    }) => {
      if (!projectId) return;
      const request = await createRequestMutation({
        variables: {
          projectId,
          title: data.title,
          description: data.description,
          state: data.state as GQLRequestState,
          reviewersId: data.reviewersId,
          items: data.items,
        },
      });
      if (request.errors || !request.data?.createRequest) {
        Notification.error({ message: t("Failed to create request.") });
        return;
      }
      Notification.success({ message: t("Successfully created request!") });
      setRequestModalShown(false);
    },
    [createRequestMutation, projectId, t],
  );

  const [updateRequestMutation] = useUpdateRequestMutation();

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
      setRequestModalShown(false);
    },
    [updateRequestMutation, t],
  );
  const handleModalClose = useCallback(() => setRequestModalShown(false), []);

  const handleModalOpen = useCallback(() => setRequestModalShown(true), []);

  const handleAddItemToRequestModalClose = useCallback(
    () => setAddItemToRequestModalShown(false),
    [],
  );

  const handleAddItemToRequestModalOpen = useCallback(
    () => setAddItemToRequestModalShown(true),
    [],
  );

  return {
    requests,
    itemId,
    currentModel,
    currentItem,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    addItemToRequestModalShown,
    workspaceUserMembers,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleNavigateToModel,
    handleRequestCreate,
    handleRequestUpdate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
  };
};
