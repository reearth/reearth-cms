import { useMemo } from "react";

import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

import useContentHooks from "../hooks";

export default () => {
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
      ellipsis: true,
    }));
  }, [currentModel?.schema.fields]);

  return {
    currentModel,
    itemsDataLoading,
    contentTableFields,
    contentTableColumns,
    handleItemsReload,
  };
};
