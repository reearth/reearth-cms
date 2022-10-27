import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";
import { useSearchItemsQuery } from "@reearth-cms/gql/graphql-client-api";

import useContentHooks from "../hooks";

export default () => {
  const navigate = useNavigate();
  const { projectId, workspaceId, modelId } = useParams();
  const { currentModel, itemsData, handleItemsReload, itemsDataLoading } = useContentHooks();
  const [searchTerm, setSearchTerm] = useState<string>();

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

  const { refetch } = useSearchItemsQuery({
    variables: {
      query: { project: projectId as string, workspace: workspaceId as string, q: searchTerm },
    },
    notifyOnNetworkStatusChange: true,
  });

  const handleSearchTerm = useCallback((term?: string) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      refetch({
        query: { project: projectId as string, workspace: workspaceId as string, q: searchTerm },
      });
    }
  }, [searchTerm, projectId, workspaceId, refetch]);

  return {
    currentModel,
    itemsDataLoading,
    contentTableFields,
    contentTableColumns,
    handleModelSelect,
    handleNavigateToItemForm,
    handleNavigateToItemEditForm,
    handleItemsReload,
    handleSearchTerm,
  };
};
