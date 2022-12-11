import styled from "@emotion/styled";
import { Key, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Icon from "@reearth-cms/components/atoms/Icon";
import { ProColumns, TableRowSelection } from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { useT } from "@reearth-cms/i18n";

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  loading: boolean;
  selectedItem: Item | undefined;
  selection: {
    selectedRowKeys: Key[];
  };
  onItemSelect: (itemId: string) => void;
  setSelection: (input: { selectedRowKeys: Key[] }) => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onItemsReload: () => void;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  selectedItem,
  selection,
  onItemSelect,
  setSelection,
  onItemEdit,
  onItemDelete,
  onItemsReload,
}) => {
  const t = useT();

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

  const rowSelection: TableRowSelection = {
    selectedRowKeys: selection.selectedRowKeys,
    onChange: (selectedRowKeys: any) => {
      setSelection({
        ...selection,
        selectedRowKeys: selectedRowKeys,
      });
    },
  };

  const AlertOptions = (props: any) => {
    return (
      <Space size={16}>
        <DeselectButton onClick={props.onCleanSelected}>
          <Icon icon="clear" /> {t("Deselect")}
        </DeselectButton>
        <DeleteButton onClick={() => onItemDelete?.(props.selectedRowKeys)}>
          <Icon icon="delete" /> {t("Delete")}
        </DeleteButton>
      </Space>
    );
  };

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
      tableAlertOptionRender={AlertOptions}
      rowSelection={rowSelection}
      columns={[...actionsColumn, ...contentTableColumns]}
    />
  ) : null;
};

export default ContentTable;

const DeselectButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;
