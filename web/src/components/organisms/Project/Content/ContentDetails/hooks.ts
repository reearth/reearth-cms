import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import { FormItem, Item, ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import {
  RequestUpdatePayload,
  RequestState,
} from "@reearth-cms/components/molecules/Request/types";
import { FieldType } from "@reearth-cms/components/molecules/Schema/types";
import { Member, Role } from "@reearth-cms/components/molecules/Workspace/types";
import { convertItem } from "@reearth-cms/components/organisms/Project/Content/convertItem";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Item as GQLItem,
  RequestState as GQLRequestState,
  SchemaFieldType,
  useCreateItemMutation,
  useCreateRequestMutation,
  useGetItemQuery,
  useGetMeQuery,
  useUpdateItemMutation,
  useUpdateRequestMutation,
  useGetItemsQuery,
  useGetItemsByIdsQuery,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

export default () => {
  const {
    currentModel,
    currentWorkspace,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleRequestTableChange,
    loading,
    totalCount,
    page,
    pageSize,
  } = useContentHooks();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData } = useGetMeQuery();

  const { itemId, modelId } = useParams();
  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [requestModalShown, setRequestModalShown] = useState(false);
  const [linkItemModalPage, setLinkItemModalPage] = useState<number>(1);
  const [linkItemModalPageSize, setLinkItemModalPageSize] = useState<number>(10);
  const [refernceModelId, setReferenceModelId] = useState<string | undefined>(modelId);

  useEffect(() => {
    setLinkItemModalPage(+linkItemModalPage);
    setLinkItemModalPageSize(+linkItemModalPageSize);
  }, [setLinkItemModalPage, setLinkItemModalPageSize, linkItemModalPage, linkItemModalPageSize]);
  const t = useT();

  const { data } = useGetItemQuery({
    fetchPolicy: "no-cache",
    variables: { id: itemId ?? "" },
    skip: !itemId,
  });

  const { data: itemsData } = useGetItemsQuery({
    fetchPolicy: "no-cache",
    variables: {
      modelId: refernceModelId ?? "",
      pagination: {
        first: linkItemModalPageSize,
        offset: (linkItemModalPage - 1) * linkItemModalPageSize,
      },
    },
    skip: !refernceModelId,
  });

  const handleLinkItemTableChange = useCallback((page: number, pageSize: number) => {
    setLinkItemModalPage(page);
    setLinkItemModalPageSize(pageSize);
  }, []);

  const linkedItemsModalList: FormItem[] | undefined = useMemo(() => {
    return itemsData?.items.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is FormItem => !!contentTableField);
  }, [itemsData?.items.nodes]);

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

  const myRole: Role = useMemo(
    () => currentWorkspace?.members?.find(m => m.userId === me?.id).role,
    [currentWorkspace?.members, me?.id],
  );

  const showPublishAction = useMemo(
    () => !currentProject?.requestRoles?.includes(myRole),
    [currentProject?.requestRoles, myRole],
  );

  const currentItem: Item | undefined = useMemo(
    () => convertItem(data?.node as GQLItem),
    [data?.node],
  );

  const formReferenceItemsIds = useMemo(
    () =>
      currentItem?.fields
        ?.filter(field => field.value && field.type === "Reference")
        .map(field => field.value) ?? [],
    [currentItem?.fields],
  );

  const { data: gqlFormItemsData } = useGetItemsByIdsQuery({
    fetchPolicy: "no-cache",
    variables: {
      id: formReferenceItemsIds,
    },
    skip: formReferenceItemsIds.length === 0,
  });

  const formItemsData: FormItem[] | undefined = useMemo(
    () => gqlFormItemsData?.nodes as FormItem[],
    [gqlFormItemsData?.nodes],
  );

  const handleNavigateToModel = useCallback(
    (modelId?: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}${
          location.state ?? ""
        }`,
      );
    },
    [navigate, currentWorkspace?.id, currentProject?.id, location.state],
  );
  const [createNewItem, { loading: itemCreationLoading }] = useCreateItemMutation({
    refetchQueries: ["SearchItem", "GetRequests"],
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
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${item.data.createItem.item.id}`,
      );
      Notification.success({ message: t("Successfully created Item!") });
    },
    [currentModel, currentProject?.id, currentWorkspace?.id, createNewItem, navigate, t],
  );

  const [updateItem, { loading: itemUpdatingLoading }] = useUpdateItemMutation({
    refetchQueries: ["SearchItem", "GetItem"],
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
          version: currentItem?.version ?? "",
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }

      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, currentItem, t],
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

  const [createRequestMutation, { loading: requestCreationLoading }] = useCreateRequestMutation({
    refetchQueries: ["GetRequests"],
  });

  const handleRequestCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      state: RequestState;
      reviewersId: string[];
      items: { itemId: string }[];
    }) => {
      if (!currentProject?.id) return;
      const request = await createRequestMutation({
        variables: {
          projectId: currentProject.id,
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
    [createRequestMutation, currentProject?.id, t],
  );

  const [updateRequestMutation] = useUpdateRequestMutation({
    refetchQueries: ["GetRequests"],
  });

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

  const handleReferenceModelUpdate = useCallback((modelId?: string) => {
    setReferenceModelId(modelId);
  }, []);

  return {
    linkedItemsModalList,
    showPublishAction,
    requests,
    itemId,
    requestCreationLoading,
    currentModel,
    currentItem,
    formItemsData,
    initialFormValues,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    addItemToRequestModalShown,
    workspaceUserMembers,
    linkItemModalTotalCount: itemsData?.items.totalCount || 0,
    linkItemModalPage,
    linkItemModalPageSize,
    handleReferenceModelUpdate,
    handleLinkItemTableChange,
    handleRequestTableChange,
    requestModalLoading: loading,
    requestModalTotalCount: totalCount,
    requestModalPage: page,
    requestModalPageSize: pageSize,
    handlePublish,
    handleUnpublish,
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
