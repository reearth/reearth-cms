import { useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Icon from "@reearth-cms/components/atoms/Icon";
import { ProColumns } from "@reearth-cms/components/atoms/ProTable";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  loading: boolean;
  selectedItem: Item | undefined;
  onItemSelect: (itemId: string) => void;
  onItemEdit: (itemId: string) => void;
  onItemsReload: () => void;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  selectedItem,
  onItemSelect,
  onItemEdit,
  onItemsReload,
}) => {
  const actionsColumn: ProColumns<ContentTableField>[] = useMemo(
    () => [
      {
        render: (_, contentField) => (
          <Button
            type="link"
            icon={<Icon icon="edit" />}
            onClick={() => onItemEdit(contentField.id)}
          />
        ),
        width: 48,
        minWidth: 48,
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "commentsCount",
        key: "commentsCount",
        render: (_, item) => {
          return (
            <Button type="link" onClick={() => onItemSelect(item.id)}>
              <CustomTag
                value={item.comments?.length || 0}
                color={item.id === selectedItem?.id ? "#87e8de" : undefined}
              />
            </Button>
          );
        },
        width: 48,
        minWidth: 48,
      },
    ],
    [onItemEdit, onItemSelect, selectedItem?.id],
  );

  const options = {
    fullScreen: true,
    reload: onItemsReload,
    setting: true,
  };

  return contentTableColumns ? (
    <ResizableProTable
      options={options}
      loading={loading}
      dataSource={contentTableFields}
      proColumns={[...actionsColumn, ...contentTableColumns]}
    />
  ) : null;
};

export default ContentTable;
