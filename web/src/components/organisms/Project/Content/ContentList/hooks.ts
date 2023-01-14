import { Key, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@reearth-cms/components/atoms/Notification";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import {
  Item as GQLItem,
  useDeleteItemMutation,
  Comment as GQLComment,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

import { convertComment, convertItem } from "../convertItem";
import useContentHooks from "../hooks";

export default () => {
  const t = useT();
  const navigate = useNavigate();
  const { projectId, workspaceId, modelId } = useParams();
  const { currentModel, itemsData, handleItemsReload, itemsDataLoading } = useContentHooks();
  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [selection, setSelection] = useState<{ selectedRowKeys: Key[] }>({
    selectedRowKeys: [],
  });

  const { assetList } = useAssetHooks();

  const contentTableFields: ContentTableField[] | undefined = useMemo(() => {
    return itemsData?.items.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              author: item.user?.name ?? item.integration?.name,
              fields: item?.fields?.reduce(
                (obj, field) =>
                  Object.assign(obj, {
                    [field.schemaFieldId]:
                      field.type === "Asset"
                        ? Array.isArray(field.value)
                          ? field.value
                              .map(value => assetList.find(asset => asset.id === value)?.fileName)
                              .join(", ")
                          : assetList.find(asset => asset.id === field.value)?.fileName
                        : Array.isArray(field.value)
                        ? field.value.join(", ")
                        : field.value,
                  }),
                {},
              ),
              comments: item.thread.comments.map(comment => convertComment(comment as GQLComment)),
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is ContentTableField => !!contentTableField);
  }, [assetList, itemsData?.items.nodes]);

  const contentTableColumns: ProColumns<ContentTableField>[] | undefined = useMemo(() => {
    if (!currentModel) return;
    return [
      {
        title: t("Created By"),
        dataIndex: "author",
        key: "author",
        width: 128,
        minWidth: 128,
        ellipsis: true,
      },
      ...currentModel.schema.fields.map(field => ({
        title: field.title,
        dataIndex: ["fields", field.id],
        key: field.id,
        width: 128,
        minWidth: 128,
        ellipsis: true,
      })),
    ];
  }, [currentModel, t]);

  useEffect(() => {
    if (!modelId && currentModel) {
      navigate(`/workspace/${workspaceId}/project/${projectId}/content/${currentModel.id}`);
    }
  }, [modelId, currentModel, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModelSelect = useCallback(
    (modelId: string) => {
      navigate(`/workspace/${workspaceId}/project/${projectId}/content/${modelId}`);
    },
    [workspaceId, projectId, navigate],
  );

  const handleNavigateToItemForm = useCallback(() => {
    navigate(`/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details`);
  }, [navigate, workspaceId, projectId, modelId]);

  const handleNavigateToItemEditForm = useCallback(
    (itemId: string) => {
      navigate(
        `/workspace/${workspaceId}/project/${projectId}/content/${modelId}/details/${itemId}`,
      );
    },
    [workspaceId, projectId, modelId, navigate],
  );

  const [deleteItemMutation] = useDeleteItemMutation();
  const handleItemDelete = useCallback(
    (itemIds: string[]) =>
      (async () => {
        const results = await Promise.all(
          itemIds.map(async itemId => {
            const result = await deleteItemMutation({
              variables: { itemId },
              refetchQueries: ["GetItems"],
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
    () => convertItem(itemsData?.items.nodes.find(item => item?.id === selectedItemId) as GQLItem),
    [itemsData?.items.nodes, selectedItemId],
  );

  return {
    currentModel,
    itemsDataLoading,
    contentTableFields,
    contentTableColumns,
    collapsedModelMenu,
    collapsedCommentsPanel,
    selectedItem,
    selection,
    setSelection,
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleItemDelete,
  };
};
