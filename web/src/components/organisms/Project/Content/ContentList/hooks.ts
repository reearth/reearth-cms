import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  AndConditionInput,
  Column,
  FieldType,
  ItemSort,
  SortDirection,
} from "@reearth-cms/components/molecules/View/types";
import {
  convertItem,
  convertComment,
} from "@reearth-cms/components/organisms/Project/Content/convertItem";
import useContentHooks from "@reearth-cms/components/organisms/Project/Content/hooks";
import {
  Item as GQLItem,
  useDeleteItemMutation,
  Comment as GQLComment,
  useSearchItemQuery,
  Asset as GQLAsset,
  useGetItemsByIdsQuery,
  useUpdateItemMutation,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { toGraphAndConditionInput, toGraphItemSort } from "@reearth-cms/utils/values";

import { renderField } from "./renderFields";
import { fileName } from "./utils";

export type CurrentViewType = {
  id?: string;
  sort?: ItemSort;
  filter?: AndConditionInput;
  columns?: Column[];
};

const defaultViewSort = {
  direction: "DESC" as SortDirection,
  field: {
    type: "MODIFICATION_DATE" as FieldType,
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
    loading: requestModalLoading,
    totalCount: requestModalTotalCount,
    page: requestModalPage,
    pageSize: requestModalPageSize,
  } = useContentHooks();
  const t = useT();

  const navigate = useNavigate();
  const { modelId } = useParams();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentView, setCurrentView] = useState<CurrentViewType>({
    columns: [],
  });

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
        //if there is no sort in the current view, show data in the default view sort
        sort: currentView.sort
          ? toGraphItemSort(currentView.sort)
          : toGraphItemSort(defaultViewSort),
        filter: currentView.filter
          ? {
              and: toGraphAndConditionInput(currentView.filter),
            }
          : undefined,
      },
    },
    skip: !currentModel?.id,
  });

  const handleItemsReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selection, setSelection] = useState<{ selectedRowKeys: string[] }>({
    selectedRowKeys: [],
  });

  const referencedItemsIds = useMemo(
    () =>
      data?.searchItem?.nodes
        ? data.searchItem.nodes
            .filter(item => item?.fields && item?.fields.length > 0)
            .flatMap(item =>
              item?.fields
                .filter(field => field.type === "Reference" && field.value)
                .map(field => field.value),
            )
        : [],
    [data],
  );

  const { data: referencedItems } = useGetItemsByIdsQuery({
    fetchPolicy: "no-cache",
    variables: {
      id: referencedItemsIds,
    },
    skip: !referencedItemsIds.length,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const referencedItemsMap = new Map<string, any>();
  (referencedItems?.nodes ?? []).forEach(item => {
    if (item && item.__typename === "Item") {
      referencedItemsMap.set(item.id, item);
    }
  });

  const [updateItemMutation] = useUpdateItemMutation({
    refetchQueries: ["SearchItem", "GetViews"],
  });

  const handleMetaItemUpdate = useCallback(
    async (
      updateItemId: string,
      version: string,
      key: string,
      value?: string | string[] | boolean,
      index?: number,
    ) => {
      const target = data?.searchItem.nodes.find(item => item?.id === updateItemId);
      if (!target?.metadata?.id || !target?.metadata?.fields) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }
      const fields = target.metadata.fields.map(field => {
        if (field.schemaFieldId === key) {
          if (Array.isArray(field.value) && field.type !== "Tag") {
            field.value[index ?? 0] = value ?? "";
          } else {
            field.value = value ?? "";
          }
        } else {
          field.value = field.value ?? "";
        }
        return field as typeof field & { value: any };
      });

      const item = await updateItemMutation({
        variables: {
          itemId: target.metadata?.id,
          fields,
          version,
        },
      });
      if (item.errors || !item.data?.updateItem) {
        Notification.error({ message: t("Failed to update item.") });
        return;
      }

      Notification.success({ message: t("Successfully updated Item!") });
    },
    [data?.searchItem.nodes, t, updateItemMutation],
  );

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
              fields: item?.fields?.reduce(
                (obj, field) =>
                  Object.assign(obj, {
                    [field.schemaFieldId]:
                      field.type === "Asset"
                        ? Array.isArray(field.value)
                          ? field.value
                              .map(value =>
                                fileName(
                                  (item?.assets as GQLAsset[])?.find(asset => asset?.id === value)
                                    ?.url,
                                ),
                              )
                              .join(", ")
                          : fileName(
                              (item?.assets as GQLAsset[])?.find(asset => asset?.id === field.value)
                                ?.url,
                            )
                        : field.type === "Reference"
                        ? referencedItemsMap.get(field.value)?.title ?? ""
                        : Array.isArray(field.value)
                        ? field.value.length > 0
                          ? field.value.map(v => "" + v)
                          : null
                        : field.value === null
                        ? null
                        : "" + field.value,
                  }),
                {},
              ),
              comments: item.thread.comments.map(comment => convertComment(comment as GQLComment)),
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              metadata: item?.metadata?.fields?.reduce(
                (obj, field) =>
                  Object.assign(obj, {
                    [field.schemaFieldId]: Array.isArray(field.value)
                      ? field.value.length > 0
                        ? field.value.map(v => "" + v)
                        : null
                      : field.value === null
                      ? null
                      : "" + field.value,
                  }),
                {},
              ),
              metadataId: item.metadata?.id,
              version: item.metadata?.version,
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is ContentTableField => !!contentTableField);
  }, [data?.searchItem.nodes, referencedItemsMap]);

  const contentTableColumns: ExtendedColumns[] | undefined = useMemo(() => {
    if (!currentModel) return;
    const fieldsColumns = currentModel?.schema?.fields?.map(field => ({
      title: field.title,
      dataIndex: ["fields", field.id],
      fieldType: "FIELD",
      key: field.id,
      ellipsis: true,
      type: field.type,
      typeProperty: field.typeProperty,
      width: 128,
      minWidth: 128,
      multiple: field.multiple,
      required: field.required,
      sorter: true,
      sortOrder:
        currentView.sort?.field.id === field.id
          ? currentView.sort?.direction === "ASC"
            ? ("ascend" as const)
            : ("descend" as const)
          : null,
      render: (el: any) => renderField(el, field),
    }));

    const metadataColumns =
      currentModel?.metadataSchema?.fields?.map(field => ({
        title: field.title,
        dataIndex: ["metadata", field.id],
        fieldType: "META_FIELD",
        key: field.id,
        ellipsis: true,
        type: field.type,
        typeProperty: field.typeProperty,
        width: 128,
        minWidth: 128,
        multiple: field.multiple,
        required: field.required,
        sorter: true,
        sortOrder:
          currentView.sort?.field.id === field.id
            ? currentView.sort?.direction === "ASC"
              ? ("ascend" as const)
              : ("descend" as const)
            : null,
        render: (el: any, record: ContentTableField) => {
          return renderField(el, field, (value?: string | string[] | boolean, index?: number) => {
            handleMetaItemUpdate(record.id, record.version, field.id, value, index);
          });
        },
      })) || [];

    return [...fieldsColumns, ...metadataColumns];
  }, [currentModel, currentView.sort?.direction, currentView.sort?.field.id, handleMetaItemUpdate]);

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

  const handleNavigateToItemForm = useCallback(() => {
    navigate(
      `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details`,
    );
  }, [currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate]);

  const handleNavigateToItemEditForm = useCallback(
    (itemId: string) => {
      navigate(
        `/workspace/${currentWorkspace?.id}/project/${currentProject?.id}/content/${currentModel?.id}/details/${itemId}`,
        { state: location.search },
      );
    },
    [currentWorkspace?.id, currentProject?.id, currentModel?.id, navigate],
  );

  const [deleteItemMutation] = useDeleteItemMutation();
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
          setSelection({ selectedRowKeys: [] });
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
    () => convertItem(data?.searchItem.nodes.find(item => item?.id === selectedItemId) as GQLItem),
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

  const handleFilterChange = useCallback((filter?: AndConditionInput) => {
    setCurrentView(prev => ({
      ...prev,
      filter,
    }));
    setPage(1);
  }, []);

  const handleBulkAddItemToRequest = useCallback(
    async (request: Request, itemIds: string[]) => {
      await handleAddItemToRequest(request, itemIds);
      refetch();
      setSelection({ selectedRowKeys: [] });
    },
    [handleAddItemToRequest, refetch],
  );

  return {
    currentModel,
    loading,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selection,
    totalCount: data?.searchItem.totalCount ?? 0,
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
    setSelection,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleViewChange,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
  };
};
