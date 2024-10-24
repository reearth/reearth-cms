import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { renderField } from "@reearth-cms/components/molecules/Content/RenderField";
import { renderTitle } from "@reearth-cms/components/molecules/Content/RenderTitle";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import {
  ContentTableField,
  Item,
  ItemStatus,
  ItemField,
  Metadata,
} from "@reearth-cms/components/molecules/Content/types";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import {
  ConditionInput,
  ItemSort,
  View,
  CurrentView,
} from "@reearth-cms/components/molecules/View/types";
import {
  fromGraphQLItem,
  fromGraphQLComment,
} from "@reearth-cms/components/organisms/DataConverters/content";
import {
  fromGraphQLView,
  toGraphItemSort,
  toGraphConditionInput,
} from "@reearth-cms/components/organisms/DataConverters/table";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Item as GQLItem,
  useDeleteItemMutation,
  Comment as GQLComment,
  useSearchItemQuery,
  Asset as GQLAsset,
  useGetItemLazyQuery,
  useUpdateItemMutation,
  useCreateItemMutation,
  SchemaFieldType,
  View as GQLView,
  useGetViewsQuery,
  ItemFieldInput,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useCollapsedModelMenu } from "@reearth-cms/state";

import { fileName } from "./utils";

const defaultViewSort: ItemSort = {
  direction: "DESC",
  field: {
    type: "MODIFICATION_DATE",
  },
};

export default () => {
  const {
    currentModel,
    currentWorkspace,
    currentProject,
    requests,
    addItemToRequestModalShown,
    handleUnpublish,
    handleAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleRequestTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
    loading: requestModalLoading,
    unpublishLoading,
    totalCount: requestModalTotalCount,
    page: requestModalPage,
    pageSize: requestModalPageSize,
  } = useContentHooks();
  const t = useT();

  const navigate = useNavigate();
  const { modelId } = useParams();
  const location: {
    state?: {
      searchTerm?: string;
      currentView: CurrentView;
      page: number;
      pageSize: number;
    } | null;
  } = useLocation();
  const [searchTerm, setSearchTerm] = useState<string>(location.state?.searchTerm ?? "");
  const [page, setPage] = useState<number>(location.state?.page ?? 1);
  const [pageSize, setPageSize] = useState<number>(location.state?.pageSize ?? 20);
  const [currentView, setCurrentView] = useState<CurrentView>({});

  const viewsRef = useRef<View[]>([]);
  const prevModelIdRef = useRef<string>();

  const { data: viewData, loading: viewLoading } = useGetViewsQuery({
    variables: { modelId: modelId ?? "" },
    skip: !modelId,
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

  const { data, refetch, loading } = useSearchItemQuery({
    fetchPolicy: "no-cache",
    variables: {
      searchItemInput: {
        query: {
          project: currentProject?.id ?? "",
          model: currentModel?.id ?? "",
          schema: currentModel?.schema.id,
          q: searchTerm,
        },
        pagination: { first: pageSize, offset: (page - 1) * pageSize },
        sort: toGraphItemSort(currentView.sort ?? defaultViewSort),
        filter: toGraphConditionInput(currentView.filter),
      },
    },
    notifyOnNetworkStatusChange: true,
    skip: !currentProject?.id || !currentModel?.id || viewLoading,
  });

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const [collapsedModelMenu, collapseModelMenu] = useCollapsedModelMenu();
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<{
    selectedRows: { itemId: string; version?: string }[];
  }>({ selectedRows: [] });

  const [updateItemMutation] = useUpdateItemMutation();
  const [getItem] = useGetItemLazyQuery({ fetchPolicy: "no-cache" });
  const [createNewItem] = useCreateItemMutation();

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

  const handleMetaItemUpdate = useCallback(
    async (
      updateItemId: string,
      key: string,
      value?: string | string[] | boolean | boolean[],
      index?: number,
    ) => {
      const target = data?.searchItem.nodes.find(item => item?.id === updateItemId);
      if (!target || !currentModel?.metadataSchema?.id || !currentModel.metadataSchema.fields) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      } else {
        const metadata = itemIdToMetadata.current.get(updateItemId) ?? target.metadata;
        if (metadata?.fields && metadata.id) {
          const fields = metadata.fields.map(field => {
            if (field.schemaFieldId === key) {
              if (Array.isArray(field.value) && field.type !== "Tag") {
                field.value[index ?? 0] = value ?? "";
              } else {
                field.value = value ?? "";
              }
            } else {
              field.value = field.value ?? "";
            }
            return field as ItemFieldInput;
          });
          const item = await updateItemMutation({
            variables: {
              itemId: metadata.id,
              fields,
              version: metadata.version,
            },
          });
          if (item.errors || !item.data?.updateItem) {
            Notification.error({ message: t("Failed to update item.") });
            return;
          }
        } else {
          const fields = currentModel.metadataSchema.fields.map(field => ({
            value: field.id === key ? value : "",
            schemaFieldId: key,
            type: field.type as SchemaFieldType,
          }));
          const metaItem = await createNewItem({
            variables: {
              modelId: currentModel.id,
              schemaId: currentModel.metadataSchema.id,
              fields,
            },
          });
          if (metaItem.errors || !metaItem.data?.createItem) {
            Notification.error({ message: t("Failed to update item.") });
            return;
          }
          const item = await updateItemMutation({
            variables: {
              itemId: target.id,
              fields: target.fields.map(field => ({
                ...field,
                value: field.value ?? "",
              })),
              metadataId: metaItem?.data.createItem.item.id,
              version: target?.version ?? "",
            },
          });
          if (item.errors || !item.data?.updateItem) {
            Notification.error({ message: t("Failed to update item.") });
            return;
          }
        }
      }
      metadataVersionSet(updateItemId);
      Notification.success({ message: t("Successfully updated Item!") });
    },
    [
      createNewItem,
      currentModel?.id,
      currentModel?.metadataSchema.fields,
      currentModel?.metadataSchema.id,
      data?.searchItem.nodes,
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
              id: item.id,
              schemaId: item.schemaId,
              status: item.status as ItemStatus,
              createdBy: item.createdBy?.name,
              updatedBy: item.updatedBy?.name || "",
              fields: fieldsGet(item as unknown as Item),
              comments: item.thread.comments.map(comment =>
                fromGraphQLComment(comment as GQLComment),
              ),
              version: item.version,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              metadata: metadataGet(item?.metadata?.fields as ItemField[] | undefined),
              metadataId: item.metadata?.id,
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

  const contentTableColumns: ExtendedColumns[] | undefined = useMemo(() => {
    if (!currentModel) return;
    const fieldsColumns = currentModel?.schema?.fields?.map(field => ({
      title: field.title,
      dataIndex: ["fields", field.id],
      fieldType: "FIELD" as const,
      key: field.id,
      ellipsis: true,
      type: field.type,
      typeProperty: field.typeProperty,
      width: 128,
      minWidth: 128,
      multiple: field.multiple,
      required: field.required,
      sorter: true,
      sortOrder: sortOrderGet(field.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (el: any) => renderField(el, field),
    }));

    const metadataColumns =
      currentModel?.metadataSchema?.fields?.map(field => ({
        title: renderTitle(field),
        dataIndex: ["metadata", field.id],
        fieldType: "META_FIELD" as const,
        key: field.id,
        ellipsis: true,
        type: field.type,
        typeProperty: field.typeProperty,
        width: 128,
        minWidth: 128,
        multiple: field.multiple,
        required: field.required,
        sorter: true,
        sortOrder: sortOrderGet(field.id),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (el: any, record: ContentTableField) => {
          return renderField(el, field, (value?: string | string[] | boolean, index?: number) => {
            handleMetaItemUpdate(record.id, field.id, value, index);
          });
        },
      })) || [];

    return [...fieldsColumns, ...metadataColumns];
  }, [currentModel, handleMetaItemUpdate, sortOrderGet]);

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
        { state: { searchTerm, currentView, page, pageSize } },
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

  const [deleteItemMutation, { loading: deleteLoading }] = useDeleteItemMutation();
  const handleItemDelete = useCallback(
    (itemIds: string[]) =>
      (async () => {
        const results = await Promise.all(
          itemIds.map(async itemId => {
            const result = await deleteItemMutation({
              variables: { itemId },
              refetchQueries: ["SearchItem"],
            });
            if (result.errors) {
              Notification.error({ message: t("Failed to delete one or more items.") });
            }
          }),
        );
        if (results) {
          Notification.success({ message: t("One or more items were successfully deleted!") });
          setSelectedItems({ selectedRows: [] });
        }
      })(),
    [t, deleteItemMutation],
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
      refetch();
      setSelectedItems({ selectedRows: [] });
    },
    [handleAddItemToRequest, refetch],
  );

  return {
    currentModel,
    loading,
    deleteLoading,
    unpublishLoading,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selectedItems,
    totalCount: data?.searchItem.totalCount ?? 0,
    views: viewsRef.current,
    currentView,
    searchTerm,
    page,
    pageSize,
    requests,
    addItemToRequestModalShown,
    setCurrentView,
    handleRequestTableChange,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    handleUnpublish,
    handleBulkAddItemToRequest,
    handleAddItemToRequestModalClose,
    handleAddItemToRequestModalOpen,
    handleSearchTerm,
    handleFilterChange,
    setSelectedItems,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleViewChange,
    handleViewSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
    handleRequestSearchTerm,
    handleRequestTableReload,
  };
};
