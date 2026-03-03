import { skipToken, useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { Key, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Notification from "@reearth-cms/components/atoms/Notification";
import { checkIfEmpty } from "@reearth-cms/components/molecules/Content/Form/fields/utils";
import { renderField } from "@reearth-cms/components/molecules/Content/RenderField";
import { renderTitle } from "@reearth-cms/components/molecules/Content/RenderTitle";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import {
  ContentTableField,
  Item,
  ItemField,
  ItemStatus,
  Metadata,
} from "@reearth-cms/components/molecules/Content/types";
import { selectedTagIdsGet } from "@reearth-cms/components/molecules/Content/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import useUploaderHook from "@reearth-cms/components/molecules/Uploader/hooks";
import { UploaderQueueItem } from "@reearth-cms/components/molecules/Uploader/types";
import {
  ConditionInput,
  CurrentView,
  ItemSort,
  View,
} from "@reearth-cms/components/molecules/View/types";
import {
  fromGraphQLComment,
  fromGraphQLItem,
} from "@reearth-cms/components/organisms/DataConverters/content";
import {
  fromGraphQLView,
  toGraphConditionInput,
  toGraphItemSort,
} from "@reearth-cms/components/organisms/DataConverters/table";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Asset as GQLAsset,
  Comment as GQLComment,
  Item as GQLItem,
  View as GQLView,
  ItemFieldInput,
  JobStatus,
  SchemaFieldType,
} from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  CreateItemDocument,
  DeleteItemsDocument,
  GetItemDocument,
  SearchItemDocument,
  UpdateItemDocument,
} from "@reearth-cms/gql/__generated__/item.generated";
import { GetViewsDocument } from "@reearth-cms/gql/__generated__/view.generated";
import { useT } from "@reearth-cms/i18n";
import { useCollapsedModelMenu, useUserId, useUserRights } from "@reearth-cms/state";

import { fileName } from "./utils";

const defaultViewSort: ItemSort = {
  direction: "DESC",
  field: {
    type: "MODIFICATION_DATE",
  },
};

export type ValidateImportResult = {
  canForwardToImport?: boolean;
  description: string;
  hint?: string;
  title: string;
  type: "error" | "warning";
};

export default () => {
  const {
    addItemToRequestModalShown,
    currentModel,
    currentProject,
    currentWorkspace,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handlePublish: _handlePublish,
    handleRequestSearchTerm,
    handleRequestTableChange,
    handleRequestTableReload,
    handleUnpublish: _handleUnpublish,
    loading: requestModalLoading,
    page: requestModalPage,
    pageSize: requestModalPageSize,
    publishLoading,
    requests,
    showPublishAction,
    totalCount: requestModalTotalCount,
    unpublishLoading,
  } = useContentHooks();
  const t = useT();
  const { handleEnqueueJob, uploaderState } = useUploaderHook();

  const navigate = useNavigate();
  const { modelId } = useParams();
  const location: {
    state?: {
      currentView: CurrentView;
      isImportModalOpen: boolean;
      page: number;
      pageSize: number;
      searchTerm?: string;
    } | null;
  } = useLocation();

  const currentWorkspaceId = useMemo(() => currentWorkspace?.id, [currentWorkspace?.id]);
  const currentProjectId = useMemo(() => currentProject?.id, [currentProject?.id]);

  const [isImportContentModalOpen, setIsImportContentModalOpen] = useState(
    location.state?.isImportModalOpen || false,
  );
  const [dataChecking, setDataChecking] = useState(false);
  const [alertList, setAlertList] = useState<AlertProps[]>([]);
  const [validateImportResult, setValidateImportResult] = useState<null | ValidateImportResult>(
    null,
  );

  const [userId] = useUserId();
  const [userRights] = useUserRights();

  const hasCreateRight = useMemo(() => !!userRights?.content.create, [userRights?.content.create]);
  const [hasDeleteRight, setHasDeleteRight] = useState(false);
  const hasPublishRight = useMemo(
    () => !!userRights?.content.publish,
    [userRights?.content.publish],
  );
  const [hasRequestUpdateRight, setHasRequestUpdateRight] = useState(false);

  const [searchTerm, setSearchTerm] = useState<string>(location.state?.searchTerm ?? "");
  const [page, setPage] = useState<number>(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(location.state?.pageSize ?? 20);
  const [currentView, setCurrentView] = useState<CurrentView>({});

  const viewsRef = useRef<View[]>([]);
  const prevModelIdRef = useRef<string>();

  const { data: viewData, loading: viewLoading } = useQuery(GetViewsDocument, {
    skip: !modelId,
    variables: { modelId: modelId ?? "" },
  });

  useEffect(() => {
    if (viewLoading) return;
    const viewList = viewData?.view?.map(view => fromGraphQLView(view as GQLView));
    if (viewList?.length) {
      if (prevModelIdRef.current === modelId) {
        if (viewList.length > viewsRef.current.length) {
          setCurrentView(viewList[viewList.length - 1]);
        } else {
          setCurrentView(prev => viewList.find(view => view.id === prev.id) ?? viewList[0]);
        }
      } else {
        setCurrentView(location.state?.currentView ?? viewList[0]);
      }
    } else {
      setCurrentView({});
    }
    prevModelIdRef.current = modelId;
    viewsRef.current = viewList ?? [];
  }, [location.state?.currentView, modelId, viewData?.view, viewLoading]);

  const { data, loading, refetch } = useQuery(
    SearchItemDocument,
    currentProject?.id && currentModel?.id && !viewLoading
      ? {
          fetchPolicy: "no-cache",
          notifyOnNetworkStatusChange: true,
          variables: {
            searchItemInput: {
              filter: toGraphConditionInput(currentView.filter),
              pagination: { first: pageSize, offset: (page - 1) * pageSize },
              query: {
                model: currentModel.id,
                project: currentProject.id,
                q: searchTerm,
                schema: currentModel.schema.id,
              },
              sort: toGraphItemSort(currentView.sort ?? defaultViewSort),
            },
          },
        }
      : skipToken,
  );

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const [collapsedModelMenu, collapseModelMenu] = useCollapsedModelMenu();
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<{
    selectedRows: { itemId: string; version?: string }[];
  }>({ selectedRows: [] });

  const handleSelect = useCallback(
    (_selectedRowKeys: Key[], selectedRows: ContentTableField[]) => {
      setSelectedItems({
        ...selectedItems,
        selectedRows: selectedRows.map(row => ({ itemId: row.id, version: row.version })),
      });

      const newRight =
        userRights?.content.delete === null
          ? selectedRows.every(row => row.createdBy.id === userId)
          : !!userRights?.content.delete;
      setHasDeleteRight(newRight);

      if (userRights?.request.update || userRights?.request.update === null) {
        setHasRequestUpdateRight(selectedRows.every(row => row.status !== "PUBLIC"));
      }
    },
    [selectedItems, userId, userRights?.content.delete, userRights?.request.update],
  );

  const [updateItemMutation] = useMutation(UpdateItemDocument);
  const [getItem] = useLazyQuery(GetItemDocument, { fetchPolicy: "no-cache" });
  const [createNewItem] = useMutation(CreateItemDocument);

  const itemIdToMetadata = useRef(new Map<string, Metadata>());
  const metadataVersionSet = useCallback(
    async (id: string) => {
      const { data } = await getItem({ variables: { id } });
      const item = fromGraphQLItem(data?.node as GQLItem);
      if (item) {
        itemIdToMetadata.current.set(id, item.metadata);
      }
    },
    [getItem],
  );

  const metaFieldsMap = useMemo(
    () => new Map((currentModel?.metadataSchema.fields || []).map(field => [field.id, field])),
    [currentModel?.metadataSchema.fields],
  );

  const handleMetaItemUpdate = useCallback(
    async (
      updateItemId: string,
      key: string,
      value?: boolean | boolean[] | string | string[],
      index?: number,
    ) => {
      const target = data?.searchItem.nodes.find(item => item?.id === updateItemId);
      if (!target || !currentModel?.metadataSchema?.id || !metaFieldsMap) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      } else {
        const metadata = itemIdToMetadata.current.get(updateItemId) ?? target.metadata;
        if (metadata?.fields && metadata.id) {
          const requiredErrorFields: string[] = [];
          const maxLengthErrorFields: string[] = [];
          const fields = metadata.fields.map(field => {
            const metaField = metaFieldsMap.get(field.schemaFieldId);
            if (field.schemaFieldId === key) {
              if (Array.isArray(field.value)) {
                if (field.type === "Tag") {
                  const tags = metaField?.typeProperty?.tags;
                  field.value = tags ? selectedTagIdsGet(value as string[], tags) : [];
                } else {
                  field.value[index ?? 0] = value === "" ? undefined : value;
                }
              } else {
                field.value = value ?? "";
              }
            } else {
              field.value = field.value ?? "";
            }
            const fieldValue = field.value;
            if (metaField?.required) {
              if (Array.isArray(fieldValue)) {
                if (fieldValue.every(v => checkIfEmpty(v))) {
                  requiredErrorFields.push(metaField.key);
                }
              } else if (checkIfEmpty(fieldValue)) {
                requiredErrorFields.push(metaField.key);
              }
            }
            const maxLength = metaField?.typeProperty?.maxLength;
            if (maxLength) {
              if (Array.isArray(fieldValue)) {
                if (fieldValue.some(v => typeof v === "string" && v.length > maxLength)) {
                  maxLengthErrorFields.push(metaField.key);
                }
              } else if (typeof fieldValue === "string" && fieldValue.length > maxLength) {
                maxLengthErrorFields.push(metaField.key);
              }
            }

            return field as ItemFieldInput;
          });
          if (requiredErrorFields.length || maxLengthErrorFields.length) {
            requiredErrorFields.forEach(field => {
              Notification.error({ message: t("{{field}} field is required!", { field }) });
            });
            maxLengthErrorFields.forEach(field => {
              Notification.error({ message: t("Maximum length error", { field }) });
            });
            return;
          }
          const item = await updateItemMutation({
            variables: {
              fields,
              itemId: metadata.id,
              version: metadata.version,
            },
          });
          if (item.error || !item.data?.updateItem) {
            Notification.error({ message: t("Failed to update item.") });
            return;
          }
        } else {
          const fields = [...metaFieldsMap].map(field => ({
            schemaFieldId: key,
            type: field[1].type as SchemaFieldType,
            value: field[1].id === key ? value : "",
          }));
          const metaItem = await createNewItem({
            variables: {
              fields,
              modelId: currentModel.id,
              schemaId: currentModel.metadataSchema.id,
            },
          });
          if (metaItem.error || !metaItem.data?.createItem) {
            Notification.error({ message: t("Failed to update item.") });
            return;
          }
          const item = await updateItemMutation({
            variables: {
              fields: target.fields.map(field => ({
                ...field,
                value: field.value ?? "",
              })),
              itemId: target.id,
              metadataId: metaItem?.data.createItem.item.id,
              version: target?.version ?? "",
            },
          });
          if (item.error || !item.data?.updateItem) {
            Notification.error({ message: t("Failed to update item.") });
            return;
          }
        }
      }
      await metadataVersionSet(updateItemId);
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [
      createNewItem,
      currentModel?.id,
      currentModel?.metadataSchema.id,
      data?.searchItem.nodes,
      metaFieldsMap,
      metadataVersionSet,
      t,
      updateItemMutation,
    ],
  );

  const fieldValueGet = useCallback((field: ItemField, item: Item) => {
    if (field.type === "Asset") {
      if (Array.isArray(field.value)) {
        if (field.value.length > 0) {
          return field.value.map(value =>
            fileName((item?.assets as GQLAsset[])?.find(asset => asset?.id === value)?.url),
          );
        } else {
          return null;
        }
      } else {
        return fileName(
          (item?.assets as GQLAsset[])?.find(asset => asset?.id === field.value)?.url,
        );
      }
    } else {
      if (field.type === "Reference") {
        return item.referencedItems?.find(ref => ref.id === field.value)?.title ?? field.value;
      } else {
        if (Array.isArray(field.value) && field.value.length > 0) {
          return field.value.map(v => "" + v);
        } else {
          return field.value === null ? null : "" + field.value;
        }
      }
    }
  }, []);

  const fieldsGet = useCallback(
    (item: Item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: Record<string, any> = {};
      item?.fields?.map(field => {
        result[field.schemaFieldId] = fieldValueGet(field, item);
      });
      return result;
    },
    [fieldValueGet],
  );

  const metadataGet = useCallback((fields?: ItemField[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = {};
    fields?.forEach(field => {
      if (Array.isArray(field.value) && field.value.length > 0) {
        result[field.schemaFieldId] = field.value.map(v => "" + v);
      } else {
        result[field.schemaFieldId] = field.value === null ? null : "" + field.value;
      }
    });
    return result;
  }, []);

  const contentTableFields: ContentTableField[] | undefined = useMemo(() => {
    return data?.searchItem.nodes
      ?.map(item =>
        item
          ? {
              comments: item.thread?.comments.map(comment =>
                fromGraphQLComment(comment as GQLComment),
              ),
              createdAt: item.createdAt,
              createdBy: { id: item.createdBy?.id ?? "", name: item.createdBy?.name ?? "" },
              fields: fieldsGet(item as unknown as Item),
              id: item.id,
              metadata: metadataGet(item?.metadata?.fields as ItemField[] | undefined),
              metadataId: item.metadata?.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              updatedAt: item.updatedAt,
              updatedBy: item.updatedBy?.name ?? "",
              version: item.version,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is ContentTableField => !!contentTableField);
  }, [data?.searchItem.nodes, fieldsGet, metadataGet]);

  const sortOrderGet = useCallback(
    (fieldId: string) => {
      if (fieldId === currentView.sort?.field.id) {
        if (currentView.sort?.direction === "ASC") {
          return "ascend" as const;
        } else {
          return "descend" as const;
        }
      } else {
        return null;
      }
    },
    [currentView.sort?.direction, currentView.sort?.field.id],
  );

  const hasRightGet = useCallback(
    (id: string) =>
      userRights?.content.update === null ? id === userId : !!userRights?.content.update,
    [userId, userRights?.content.update],
  );

  const contentTableColumns: ExtendedColumns[] | undefined = useMemo(() => {
    if (!currentModel) return;
    const fieldsColumns = currentModel?.schema?.fields?.map(field => ({
      dataIndex: ["fields", field.id],
      ellipsis: true,
      fieldType: "FIELD" as const,
      key: field.id,
      minWidth: 128,
      multiple: field.multiple,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (el: any) => renderField(el, field),
      required: field.required,
      sorter: true,
      sortOrder: sortOrderGet(field.id),
      title: field.title,
      type: field.type,
      typeProperty: field.typeProperty,
      width: 128,
    }));

    const metadataColumns =
      currentModel?.metadataSchema?.fields?.map(field => ({
        dataIndex: ["metadata", field.id],
        ellipsis: true,
        fieldType: "META_FIELD" as const,
        key: field.id,
        minWidth: 128,
        multiple: field.multiple,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (el: any, record: ContentTableField) => {
          const update = hasRightGet(record.createdBy.id)
            ? async (value?: boolean | string | string[], index?: number) => {
                await handleMetaItemUpdate(record.id, field.id, value, index);
              }
            : undefined;
          return renderField(el, field, update);
        },
        required: field.required,
        sorter: true,
        sortOrder: sortOrderGet(field.id),
        title: renderTitle(field),
        type: field.type,
        typeProperty: field.typeProperty,
        width: 128,
      })) || [];

    return [...fieldsColumns, ...metadataColumns];
  }, [currentModel, handleMetaItemUpdate, hasRightGet, sortOrderGet]);

  useEffect(() => {
    if (!modelId && currentModel?.id) {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}`,
      );
    }
  }, [modelId, currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${modelId}`,
      );
      setSearchTerm("");
      setPage(1);
      setSelectedItems({ selectedRows: [] });
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
  );

  const handleViewChange = useCallback(() => {
    setSearchTerm("");
    setPage(1);
  }, []);

  const handleViewSelect = useCallback(
    (key: string) => {
      viewsRef.current.forEach(view => {
        if (view.id === key) {
          setCurrentView(view);
        }
      });
      handleViewChange();
    },
    [viewsRef, handleViewChange],
  );

  const handleNavigateToItemForm = useCallback(() => {
    navigate(
      `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details`,
    );
  }, [currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate]);

  const handleNavigateToItemEditForm = useCallback(
    (itemId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${itemId}`,
        { state: { currentView, page, pageSize, searchTerm } },
      );
    },
    [
      navigate,
      currentWorkspace?.id,
      currentProject?.id,
      currentModel?.id,
      searchTerm,
      currentView,
      page,
      pageSize,
    ],
  );

  const [deleteItemsMutation, { loading: deleteLoading }] = useMutation(DeleteItemsDocument);
  const handleItemDelete = useCallback(
    (itemIds: string[]) =>
      (async () => {
        const result = await deleteItemsMutation({
          refetchQueries: ["SearchItem"],
          variables: { itemIds },
        });
        if (result.error || !result.data?.deleteItems) {
          Notification.error({ message: t("Failed to delete one or more items.") });
          return;
        }
        Notification.success({ message: t("One or more items were successfully deleted!") });
        setSelectedItems({ selectedRows: [] });
      })(),
    [t, deleteItemsMutation],
  );

  const handleItemSelect = useCallback(
    (id: string) => {
      setSelectedItemId(id);
      collapseCommentsPanel(false);
    },
    [setSelectedItemId],
  );

  const selectedItem = useMemo(
    () =>
      fromGraphQLItem(data?.searchItem.nodes.find(item => item?.id === selectedItemId) as GQLItem),
    [data?.searchItem.nodes, selectedItemId],
  );

  const handleContentTableChange = useCallback(
    (page: number, pageSize: number, sorter?: ItemSort) => {
      setPage(page);
      setPageSize(pageSize);
      setCurrentView(prev => ({
        ...prev,
        sort: sorter,
      }));
    },
    [],
  );

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term ?? "");
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((filter?: ConditionInput[]) => {
    setCurrentView(prev => ({
      ...prev,
      filter: filter ? { and: { conditions: filter } } : undefined,
    }));
    setPage(1);
  }, []);

  const handleBulkAddItemToRequest = useCallback(
    async (request: Request, items: RequestItem[]) => {
      await handleAddItemToRequest(request, items);
      setSelectedItems({ selectedRows: [] });
    },
    [handleAddItemToRequest],
  );

  const modelFields = useMemo<Model["schema"]["fields"]>(
    () => (currentModel ? currentModel.schema.fields : []),
    [currentModel],
  );

  const hasModelFields = useMemo<boolean>(() => modelFields.length > 0, [modelFields.length]);

  const handleImportContentModalOpen = useCallback(() => {
    setIsImportContentModalOpen(true);
  }, []);

  const handleImportContentModalClose = useCallback(() => {
    setIsImportContentModalOpen(false);
    setAlertList([]);
    setValidateImportResult(null);
  }, []);

  const handlePublish = useCallback(
    async (itemIds: string[]) => {
      await _handlePublish(itemIds);
      await refetch();
    },
    [_handlePublish, refetch],
  );

  const handleUnpublish = useCallback(
    async (itemIds: string[]) => {
      await _handleUnpublish(itemIds);
      await refetch();
    },
    [_handleUnpublish, refetch],
  );

  useEffect(() => {
    const currentModelJobs = uploaderState.queue.reduce<UploaderQueueItem[]>(
      (acc, curr) =>
        curr.workspaceId === currentWorkspaceId &&
        curr.projectId === currentProjectId &&
        curr.modelId === modelId
          ? [...acc, curr]
          : acc,
      [],
    );
    const hasJobs = currentModelJobs.length > 0;
    const isAllCompleted = currentModelJobs.every(
      item => item.jobState.status === JobStatus.Completed,
    );

    const shouldRefetch = !viewLoading && hasJobs && isAllCompleted;

    if (shouldRefetch) refetch();
  }, [
    currentModel?.id,
    currentProject?.id,
    currentProjectId,
    currentWorkspaceId,
    modelId,
    refetch,
    uploaderState.queue,
    viewLoading,
  ]);

  return {
    addItemToRequestModalShown,
    alertList,
    collapseCommentsPanel,
    collapsedCommentsPanel,
    collapsedModelMenu,
    collapseModelMenu,
    contentTableColumns,
    contentTableFields,
    currentModel,
    currentProjectId,
    currentView,
    currentWorkspaceId,
    dataChecking,
    deleteLoading,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleBulkAddItemToRequest,
    handleContentTableChange,
    handleEnqueueJob,
    handleFilterChange,
    handleImportContentModalClose,
    handleImportContentModalOpen,
    handleItemDelete,
    handleItemSelect,
    handleItemsReload,
    handleModelSelect,
    handleNavigateToItemEditForm,
    handleNavigateToItemForm,
    handlePublish,
    handleRequestSearchTerm,
    handleRequestTableChange,
    handleRequestTableReload,
    handleSearchTerm,
    handleSelect,
    handleUnpublish,
    handleViewChange,
    handleViewSelect,
    hasCreateRight,
    hasDeleteRight,
    hasModelFields,
    hasPublishRight,
    hasRequestUpdateRight,
    isImportContentModalOpen,
    loading,
    modelFields,
    modelId,
    page,
    pageSize,
    publishLoading,
    requestModalLoading,
    requestModalPage,
    requestModalPageSize,
    requestModalTotalCount,
    requests,
    searchTerm,
    selectedItem,
    selectedItems,
    setAlertList,
    setCurrentView,
    setDataChecking,
    setValidateImportResult,
    showPublishAction,
    totalCount: data?.searchItem.totalCount ?? 0,
    unpublishLoading,
    validateImportResult,
    views: viewsRef.current,
  };
};
