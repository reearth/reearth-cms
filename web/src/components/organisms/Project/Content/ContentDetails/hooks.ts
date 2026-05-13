import { ApolloClient } from "@apollo/client";
import { skipToken, useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { User } from "@reearth-cms/components/molecules/AccountSettings/types";
import {
  FormValues,
  FormValue,
  FormGroupValue,
  FormItem,
  Item,
  ItemStatus,
  ItemField,
} from "@reearth-cms/components/molecules/Content/types";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import {
  RequestState,
  RequestItem,
  Request,
} from "@reearth-cms/components/molecules/Request/types";
import { Group, Field } from "@reearth-cms/components/molecules/Schema/types";
import { UserMember } from "@reearth-cms/components/molecules/Workspace/types";
import {
  fromGraphQLItem,
  fromGraphQLversionsByItem,
} from "@reearth-cms/components/organisms/DataConverters/content";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { fromGraphQLGroup } from "@reearth-cms/components/organisms/DataConverters/schema";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Item as GQLItem,
  Model as GQLModel,
  Group as GQLGroup,
  VersionedItem as GQLVersionedItem,
  RequestState as GQLRequestState,
  FieldType as GQLFieldType,
  ItemFieldInput,
  StringOperator,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import { GetGroupDocument } from "@reearth-cms/gql/__generated__/group.generated";
import {
  CreateItemDocument,
  GetItemDocument,
  IsItemReferencedDocument,
  SearchItemDocument,
  UpdateItemDocument,
  VersionsByItemDocument,
} from "@reearth-cms/gql/__generated__/item.generated";
import { GetModelDocument } from "@reearth-cms/gql/__generated__/model.generated";
import { CreateRequestDocument } from "@reearth-cms/gql/__generated__/requests.generated";
import { GetMeDocument } from "@reearth-cms/gql/__generated__/user.generated";
import { useT } from "@reearth-cms/i18n";
import { useCollapsedModelMenu, useUserRights } from "@reearth-cms/state";
import { newID } from "@reearth-cms/utils/id";

import { dateConvert } from "./utils";

export default () => {
  const {
    currentModel,
    currentWorkspace,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handlePublish: _handlePublish,
    handleUnpublish: _handleUnpublish,
    handleAddItemToRequest: _handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    loading,
    publishLoading,
    totalCount,
    page,
    pageSize,
    showPublishAction,
  } = useContentHooks();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userData } = useQuery(GetMeDocument);

  const { itemId } = useParams();
  const [collapsedModelMenu, collapseModelMenu] = useCollapsedModelMenu();
  const [userRights] = useUserRights();
  const hasRequestCreateRight = useMemo(
    () => !!userRights?.request.create,
    [userRights?.request.create],
  );
  const hasRequestUpdateRight = useMemo(
    () => userRights?.request.update === null || !!userRights?.request.update,
    [userRights?.request.update],
  );
  const hasPublishRight = useMemo(
    () => !!userRights?.content.publish,
    [userRights?.content.publish],
  );

  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [requestModalShown, setRequestModalShown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [linkItemModalPage, setLinkItemModalPage] = useState<number>(1);
  const [linkItemModalPageSize, setLinkItemModalPageSize] = useState<number>(10);
  const [referenceModel, setReferenceModel] = useState<Model>();

  const titleId = useRef("");
  const t = useT();

  const {
    data: itemData,
    loading: itemLoading,
    refetch: itemRefetch,
  } = useQuery(
    GetItemDocument,
    itemId
      ? {
          fetchPolicy: "cache-and-network",
          variables: { id: itemId },
        }
      : skipToken,
  );

  const [getModel] = useLazyQuery(GetModelDocument, {
    fetchPolicy: "cache-and-network",
  });

  const {
    data: itemsData,
    loading: itemsLoading,
    refetch: itemsRefetch,
  } = useQuery(
    SearchItemDocument,
    referenceModel && currentProject
      ? {
          fetchPolicy: "cache-and-network",
          variables: {
            searchItemInput: {
              query: {
                project: currentProject.id,
                model: referenceModel.id,
                schema: referenceModel?.schema.id,
              },
              pagination: {
                first: linkItemModalPageSize,
                offset: (linkItemModalPage - 1) * linkItemModalPageSize,
              },
              filter:
                searchTerm && titleId.current
                  ? {
                      and: {
                        conditions: [
                          {
                            string: {
                              fieldId: { id: titleId.current, type: GQLFieldType.Field },
                              operator: StringOperator.Contains,
                              value: searchTerm,
                            },
                          },
                        ],
                      },
                    }
                  : undefined,
            },
          },
        }
      : skipToken,
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setLinkItemModalPage(1);
  }, []);

  const handleLinkItemTableReload = useCallback(() => {
    itemsRefetch();
  }, [itemsRefetch]);

  const handleLinkItemTableChange = useCallback((page: number, pageSize: number) => {
    setLinkItemModalPage(page);
    setLinkItemModalPageSize(pageSize);
  }, []);

  const linkedItemsModalList: FormItem[] | undefined = useMemo(() => {
    return itemsData?.searchItem.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              createdBy: item.createdBy?.name,
              createdAt: item.createdAt,
              title: item.title,
              updatedAt: item.updatedAt,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is FormItem => !!contentTableField);
  }, [itemsData?.searchItem.nodes]);

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

  const currentItem: Item | undefined = useMemo(
    () => fromGraphQLItem(itemData?.node as GQLItem),
    [itemData?.node],
  );

  const hasItemUpdateRight = useMemo(
    () =>
      userRights?.content.update === null
        ? currentItem?.createdBy?.id === me?.id
        : !!userRights?.content.update,
    [currentItem?.createdBy?.id, me?.id, userRights?.content.update],
  );

  const [getGroup] = useLazyQuery(GetGroupDocument, {
    fetchPolicy: "cache-and-network",
  });

  const handleGroupGet = useCallback(
    async (id: string) => {
      const res = await getGroup({
        variables: {
          id,
        },
      }).retain();
      return fromGraphQLGroup(res.data?.node as GQLGroup);
    },
    [getGroup],
  );

  const handleNavigateToModel = useCallback(
    (modelId?: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}`,
      );
    },
    [navigate, currentWorkspace?.id, currentProject?.id],
  );

  const handleNavigateToRequest = useCallback(
    (id: string) => {
      navigate(`/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/request/${id}`);
    },
    [navigate, currentWorkspace?.id, currentProject?.id],
  );

  const handleBack = useCallback(() => {
    navigate(
      `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}`,
      { state: location.state },
    );
  }, [currentModel?.id, currentProject?.id, currentWorkspace?.id, location.state, navigate]);

  const [createItem, { loading: itemCreationLoading }] = useMutation(CreateItemDocument, {
    refetchQueries: ["GetRequests"],
  });

  const handleItemCreate = useCallback(
    async ({
      schemaId,
      metaSchemaId,
      fields,
      metaFields,
    }: {
      schemaId: string;
      metaSchemaId?: string;
      fields: ItemField[];
      metaFields: ItemField[];
    }) => {
      if (!currentModel?.id) return;
      let metadataId = null;
      if (metaSchemaId) {
        const metaItem = await createItem({
          variables: {
            modelId: currentModel.id,
            schemaId: metaSchemaId,
            fields: metaFields as ItemFieldInput[],
          },
        });
        if (metaItem.error || !metaItem.data?.createItem) {
          Notification.error({ message: t("Failed to create item.") });
          return;
        }
        metadataId = metaItem.data.createItem.item.id;
      }
      const item = await createItem({
        variables: {
          modelId: currentModel.id,
          schemaId: schemaId,
          fields: fields as ItemFieldInput[],
          metadataId,
        },
      });
      if (item.error || !item.data?.createItem) {
        Notification.error({ message: t("Failed to create item.") });
        return;
      }
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${item.data.createItem.item.id}`,
      );
      Notification.success({ message: t("Successfully created Item!") });
    },
    [currentModel?.id, createItem, navigate, currentWorkspace?.id, currentProject?.id, t],
  );

  const [updateItem, { loading: itemUpdatingLoading }] = useMutation(UpdateItemDocument, {
    refetchQueries: ["GetItem", "VersionsByItem"],
  });

  const handleItemUpdate = useCallback(
    async ({ itemId, fields }: { itemId: string; fields: ItemField[] }) => {
      const item = await updateItem({
        variables: {
          itemId: itemId,
          fields: fields as ItemFieldInput[],
          version: currentItem?.version ?? "",
        },
      });
      if (item.error || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [updateItem, currentItem?.version, t],
  );

  const handleMetaItemUpdate = useCallback(
    async ({ metaItemId, metaFields }: { metaItemId?: string; metaFields: ItemField[] }) => {
      if (metaItemId) {
        const item = await updateItem({
          variables: {
            itemId: metaItemId,
            fields: metaFields as ItemFieldInput[],
            version: currentItem?.metadata?.version ?? "",
          },
        });
        if (item.error || !item.data?.updateItem) {
          Notification.error({ message: t("Failed to update item.") });
          return;
        }
      } else if (
        currentItem &&
        currentItem.fields &&
        currentModel?.id &&
        currentModel.metadataSchema.id
      ) {
        const metaItem = await createItem({
          variables: {
            modelId: currentModel.id,
            schemaId: currentModel.metadataSchema.id,
            fields: metaFields as ItemFieldInput[],
          },
        });
        if (metaItem.error || !metaItem.data?.createItem) {
          Notification.error({ message: t("Failed to update item.") });
          return;
        }
        const item = await updateItem({
          variables: {
            itemId: currentItem.id,
            fields: currentItem.fields.map(field => ({
              ...field,
              value: field.value ?? "",
            })) as ItemFieldInput[],
            metadataId: metaItem?.data.createItem.item.id,
            version: currentItem.version,
          },
        });
        if (item.error || !item.data?.updateItem) {
          Notification.error({ message: t("Failed to update item.") });
          return;
        }
      } else {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [createItem, currentItem, currentModel?.id, currentModel?.metadataSchema.id, t, updateItem],
  );

  const valueGet = useCallback((field: Field) => {
    let result: FormValue;
    switch (field.type) {
      case "Select":
        result = field.typeProperty?.selectDefaultValue;
        break;
      case "Integer":
        result = field.typeProperty?.integerDefaultValue;
        break;
      case "Asset":
        result = field.typeProperty?.assetDefaultValue;
        break;
      case "Date":
        result = dateConvert(field.typeProperty?.defaultValue);
        break;
      default:
        result = field.typeProperty?.defaultValue;
    }
    if (field.multiple && !result) {
      result = [];
    }
    return result;
  }, []);

  const updateValueConvert = useCallback(({ type, value }: ItemField) => {
    if (type === "Group") {
      if (value) {
        return value;
      } else {
        return newID();
      }
    } else if (type === "Date") {
      return dateConvert(value);
    } else {
      return value;
    }
  }, []);

  const [initialFormValues, setInitialFormValues] = useState<
    Record<string, FormValue | FormGroupValue>
  >({});

  const initialValueGet = useCallback(
    async (fields?: ItemField[]) => {
      const initialValues: FormValues = {};
      const groupInitialValuesUpdate = (group: Group, itemGroupId: string) => {
        group?.schema?.fields?.forEach(field => {
          initialValues[field.id] = {
            ...(initialValues[field.id] as FormGroupValue),
            ...{ [itemGroupId]: valueGet(field) },
          };
        });
      };

      if (fields) {
        fields?.forEach(field => {
          if (field.itemGroupId) {
            initialValues[field.schemaFieldId] = {
              ...(initialValues[field.schemaFieldId] as FormGroupValue),
              ...{ [field.itemGroupId]: updateValueConvert(field) },
            };
          } else {
            initialValues[field.schemaFieldId] = updateValueConvert(field);
          }
        });
      } else if (currentModel) {
        await Promise.all(
          currentModel.schema.fields.map(async field => {
            if (field.type === "Group") {
              if (field.multiple) {
                initialValues[field.id] = [];
              } else {
                const id = newID();
                initialValues[field.id] = id;
                if (field.typeProperty?.groupId) {
                  const group = await handleGroupGet(field.typeProperty.groupId);
                  if (group) groupInitialValuesUpdate(group, id);
                }
              }
            } else {
              initialValues[field.id] = valueGet(field);
            }
          }),
        );
      }
      return initialValues;
    },
    [currentModel, handleGroupGet, updateValueConvert, valueGet],
  );

  useEffect(() => {
    if (itemLoading) return;
    const handleInitialValuesSet = async () => {
      setInitialFormValues(await initialValueGet(currentItem?.fields ?? undefined));
    };
    handleInitialValuesSet();
  }, [currentItem, initialValueGet, itemLoading]);

  const initialMetaFormValues: Record<string, unknown> = useMemo(() => {
    const initialValues: Record<string, unknown> = {};
    if (!currentItem && !itemLoading) {
      currentModel?.metadataSchema?.fields?.forEach(field => {
        switch (field.type) {
          case "Tag": {
            const value = field.typeProperty?.selectDefaultValue;
            initialValues[field.id] = field.multiple ? (Array.isArray(value) ? value : []) : value;
            break;
          }
          case "Date":
            initialValues[field.id] = dateConvert(field.typeProperty?.defaultValue);
            break;
          default:
            initialValues[field.id] = field.typeProperty?.defaultValue;
            break;
        }
      });
    } else {
      currentItem?.metadata.fields?.forEach(field => {
        initialValues[field.schemaFieldId] =
          field.type === "Date" ? dateConvert(field.value) : field.value;
      });
    }
    return initialValues;
  }, [currentItem, currentModel, itemLoading]);

  const workspaceUserMembers = useMemo((): UserMember[] => {
    return (
      currentWorkspace?.members
        ?.map<UserMember | undefined>(member =>
          "userId" in member
            ? {
                userId: member.userId,
                user: member.user,
                role: member.role,
              }
            : undefined,
        )
        .filter(
          (user): user is UserMember =>
            !!user && (user.role === "OWNER" || user.role === "MAINTAINER"),
        ) ?? []
    );
  }, [currentWorkspace]);

  const [createRequestMutation, { loading: requestCreationLoading }] = useMutation(
    CreateRequestDocument,
    { refetchQueries: ["GetItem", "VersionsByItem"] },
  );

  const handleRequestCreate = useCallback(
    async (data: {
      title: string;
      description: string;
      state: RequestState;
      reviewersId: string[];
      items: RequestItem[];
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
      if (request.error || !request.data?.createRequest) {
        Notification.error({ message: t("Failed to create request.") });
        return;
      }
      Notification.success({ message: t("Successfully created request!") });
      setRequestModalShown(false);
    },
    [createRequestMutation, currentProject?.id, t],
  );

  const handleModalClose = useCallback(() => setRequestModalShown(false), []);

  const handleModalOpen = useCallback(() => setRequestModalShown(true), []);

  const handleReferenceModelUpdate = useCallback(
    async (modelId: string, titleFieldId: string) => {
      try {
        const { data } = await getModel({
          variables: { id: modelId },
        }).retain();
        setReferenceModel(fromGraphQLModel(data?.node as GQLModel));
      } catch (error) {
        Notification.error({ message: String(error) });
      }

      titleId.current = titleFieldId;
      handleSearchTerm();
    },
    [getModel, handleSearchTerm],
  );

  const [checkIfItemIsReferenced] = useLazyQuery(IsItemReferencedDocument, {
    fetchPolicy: "no-cache",
  });

  const handleCheckItemReference = useCallback(
    async (itemId: string, correspondingFieldId: string, groupId?: string) => {
      const initialValue = groupId
        ? (initialFormValues[groupId] as FormGroupValue)[correspondingFieldId]
        : initialFormValues[correspondingFieldId];
      if (initialValue === itemId) {
        return false;
      }
      const res = await checkIfItemIsReferenced({
        variables: { itemId, correspondingFieldId },
      });
      return res.data?.isItemReferenced ?? false;
    },
    [checkIfItemIsReferenced, initialFormValues],
  );

  const title = useMemo(() => {
    let result = currentModel?.name ?? "";
    if (currentItem) {
      result += ` / ${currentItem.title || currentItem.id}`;
    }
    return result;
  }, [currentItem, currentModel?.name]);

  const { data: versionsData, refetch: versionsRefetch } = useQuery(
    VersionsByItemDocument,
    itemId
      ? {
          fetchPolicy: "cache-and-network",
          variables: { itemId },
        }
      : skipToken,
  );

  const versions = useMemo(
    () =>
      versionsData
        ? fromGraphQLversionsByItem(versionsData.versionsByItem as GQLVersionedItem[]).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
        : [],
    [versionsData],
  );

  const handleGetVersionedItem = useCallback(
    (version: string) => {
      const res = versions.find(v => v.version === version);
      return initialValueGet(res?.fields);
    },
    [initialValueGet, versions],
  );

  const handleRefetch = useCallback(async () => {
    const refetchList: Promise<ApolloClient.QueryResult>[] = [];
    if (itemId) {
      refetchList.push(itemRefetch());
      refetchList.push(versionsRefetch());
    }

    if (referenceModel && currentProject) refetchList.push(itemsRefetch());

    await Promise.all(refetchList);
  }, [currentProject, itemId, itemRefetch, itemsRefetch, referenceModel, versionsRefetch]);

  const handlePublish = useCallback(
    async (itemIds: string[]) => {
      await _handlePublish(itemIds);
      await handleRefetch();
    },
    [_handlePublish, handleRefetch],
  );

  const handleUnpublish = useCallback(
    async (itemIds: string[]) => {
      await _handleUnpublish(itemIds);
      await handleRefetch();
    },
    [_handleUnpublish, handleRefetch],
  );

  const handleAddItemToRequest = useCallback(
    async (request: Request, items: RequestItem[]) => {
      await _handleAddItemToRequest(request, items);
      await handleRefetch();
    },
    [_handleAddItemToRequest, handleRefetch],
  );

  return {
    loadingReference: itemsLoading,
    linkedItemsModalList,
    showPublishAction,
    requests,
    itemId,
    itemLoading,
    requestCreationLoading,
    currentModel,
    title,
    currentItem,
    initialFormValues,
    initialMetaFormValues,
    versions,
    itemCreationLoading,
    itemUpdatingLoading,
    collapsedModelMenu,
    collapsedCommentsPanel,
    requestModalShown,
    addItemToRequestModalShown,
    workspaceUserMembers,
    linkItemModalTitle: referenceModel?.name ?? "",
    linkItemModalTotalCount: itemsData?.searchItem.totalCount || 0,
    linkItemModalPage,
    linkItemModalPageSize,
    handleReferenceModelUpdate,
    handleSearchTerm,
    handleLinkItemTableReload,
    handleLinkItemTableChange,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    publishLoading,
    requestModalLoading: loading,
    requestModalTotalCount: totalCount,
    requestModalPage: page,
    requestModalPageSize: pageSize,
    handleGetVersionedItem,
    handlePublish,
    handleUnpublish,
    handleAddItemToRequest,
    collapseCommentsPanel,
    collapseModelMenu,
    handleItemCreate,
    handleItemUpdate,
    handleMetaItemUpdate,
    handleNavigateToModel,
    handleNavigateToRequest,
    handleBack,
    handleRequestCreate,
    handleModalClose,
    handleModalOpen,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleGroupGet,
    handleCheckItemReference,
    hasRequestCreateRight,
    hasRequestUpdateRight,
    hasPublishRight,
    hasItemUpdateRight,
  };
};
