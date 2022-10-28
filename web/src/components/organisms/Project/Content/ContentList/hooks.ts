import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

import useContentHooks from "../hooks";

export default () => {
  const navigate = useNavigate();
  const { projectId, workspaceId, modelId } = useParams();
  const { currentModel, itemsData, handleItemsReload, itemsDataLoading } = useContentHooks();

  const contentTableFields: ContentTableField[] | undefined = useMemo(() => {
    return itemsData?.items.nodes
      ?.map(item =>
        item
          ? {
              ...item,
              fields: item?.fields?.reduce(
                (obj, field) => Object.assign(obj, { [field.schemaFieldId]: field.value }),
                {},
              ),
            }
          : undefined,
      )
      .filter((contentTableField): contentTableField is ContentTableField => !!contentTableField);
  }, [itemsData?.items.nodes]);

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

  return {
    currentModel,
    itemsDataLoading,
    contentTableFields,
    contentTableColumns,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
  };
};
