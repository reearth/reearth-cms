import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import useAssetHooks from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { Item as GQLItem, Comment as GQLComment } from "@reearth-cms/gql/graphql-client-api";

import { convertComment, convertItem } from "../convertItem";
import useContentHooks from "../hooks";

export default () => {
  const navigate = useNavigate();
  const { projectId, workspaceId, modelId } = useParams();
  const { currentModel, itemsData, handleItemsReload, itemsDataLoading } = useContentHooks();
  const [collapsedModelMenu, collapseModelMenu] = useState(false);
  const [collapsedCommentsPanel, collapseCommentsPanel] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>();

  const { assetList } = useAssetHooks();

  const contentTableFields: ContentTableField[] | undefined = useMemo(() => {
    return itemsData?.items.nodes
      ?.map(item =>
        item
          ? {
              id: item.id,
              schemaId: item.schemaId,
              fields: item?.fields?.reduce(
                (obj, field) =>
                  Object.assign(obj, {
                    [field.schemaFieldId]:
                      field.type === "Asset"
                        ? assetList.find(asset => asset.id === field.value)?.fileName
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
    return currentModel?.schema.fields.map(field => ({
      title: field.title,
      dataIndex: ["fields", field.id],
      key: field.id,
      width: 128,
      minWidth: 128,
      ellipsis: true,
    }));
  }, [currentModel?.schema.fields]);

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
    handleItemSelect,
    collapseCommentsPanel,
    collapseModelMenu,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
  };
};
