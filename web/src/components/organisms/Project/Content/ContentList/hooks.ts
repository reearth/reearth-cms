import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, ItemStatus } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { AndConditionInput, Column, ItemSort } from "@reearth-cms/components/molecules/View/types";
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
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { toGraphAndConditionInput, toGraphItemSort } from "@reearth-cms/utils/values";

import { renderTags } from "./renderFields";
import { fileName } from "./utils";

export type CurrentViewType = {
  sort?: ItemSort;
  filter?: AndConditionInput;
  columns?: Column[];
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
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = useMemo(() => searchParams.get("page"), [searchParams]);
  const pageSizeParam = useMemo(() => searchParams.get("pageSize"), [searchParams]);
  const searchTermParam = useMemo(() => searchParams.get("searchTerm"), [searchParams]);

  const navigate = useNavigate();
  const { modelId } = useParams();
  const [searchTerm, setSearchTerm] = useState<string>(searchTermParam ?? "");
  const [page, setPage] = useState<number>(pageParam ? +pageParam : 1);
  const [pageSize, setPageSize] = useState<number>(pageSizeParam ? +pageSizeParam : 10);
  const [currentView, setCurrentView] = useState<CurrentViewType>({
    columns: [],
  });

  useEffect(() => {
    setPage(pageParam ? +pageParam : 1);
    setPageSize(pageSizeParam ? +pageSizeParam : 10);
    setSearchTerm(searchTermParam ?? "");
  }, [searchTermParam, pageSizeParam, pageParam]);

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
        sort: currentView.sort ? toGraphItemSort(currentView.sort) : undefined,
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
                        ? field.value.join(", ")
                        : field.value
                        ? "" + field.value
                        : field.value,
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
                      ? field.value.join(", ")
                      : field.value
                      ? "" + field.value
                      : field.value,
                  }),
                {},
              ),
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
    }));

    const metadataColumns =
      currentModel?.metadataSchema?.fields?.map(field => {
        const result = {
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
        };
        if (field.type === "Tag") {
          Object.assign(result, { render: (el: any) => renderTags(el, field) });
        }
        return result;
      }) || [];

    return [...fieldsColumns, ...metadataColumns];
  }, [currentModel, currentView.sort?.direction, currentView.sort?.field.id]);

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
    },
    [currentWorkspace?.id, currentProject?.id, navigate],
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
      searchParams.set("page", page.toString());
      searchParams.set("pageSize", pageSize.toString());
      setCurrentView(prev => ({
        ...prev,
        sort: sorter,
      }));
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const handleSearchTerm = useCallback(
    (term?: string) => {
      searchParams.set("searchTerm", term ?? "");
      searchParams.set("page", "1");
      setSearchParams(searchParams);
    },
    [setSearchParams, searchParams],
  );

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
    setSelection,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
    handleContentTableChange,
  };
};
