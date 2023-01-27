import styled from "@emotion/styled";
import { Key, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Icon from "@reearth-cms/components/atoms/Icon";
import {
  ProColumns,
  TableRowSelection,
  TablePaginationConfig,
  ListToolBarProps,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  ItemSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  loading: boolean;
  selectedItem: Item | undefined;
  selection: {
    selectedRowKeys: string[];
  };
  totalCount: number;
  sort?: { type?: ItemSortType; direction?: SortDirection };
  searchTerm: string;
  page: number;
  pageSize: number;
  onSearchTerm: (term?: string) => void;
  onContentTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: ItemSortType; direction?: SortDirection },
  ) => void;
  onItemSelect: (itemId: string) => void;
  setSelection: (input: { selectedRowKeys: string[] }) => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onItemsReload: () => void;
  requests: Request[];
  addItemToRequestModalShown: boolean;
  onAddItemToRequest: (request: Request, itemIds: string[]) => void;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  selectedItem,
  selection,
  totalCount,
  sort,
  searchTerm,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onSearchTerm,
  onContentTableChange,
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
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        key: "CREATION_DATE",
        render: (_, item) => dateTimeFormat(item.createdAt),
        sorter: true,
        defaultSortOrder:
          sort?.type === "CREATION_DATE" ? (sort.direction === "ASC" ? "ascend" : "descend") : null,
        width: 148,
        minWidth: 148,
      },
      {
        title: t("Updated At"),
        dataIndex: "updatedAt",
        key: "MODIFICATION_DATE",
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        defaultSortOrder:
          sort?.type === "MODIFICATION_DATE"
            ? sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
      },
    ],
    [t, onItemEdit, onItemSelect, sort?.direction, sort?.type, selectedItem?.id],
  );

  const rowSelection: TableRowSelection = {
    selectedRowKeys: selection.selectedRowKeys,
    onChange: (selectedRowKeys: Key[]) => {
      setSelection({
        ...selection,
        selectedRowKeys: selectedRowKeys as string[],
      });
    },
  };

  const AlertOptions = (props: any) => {
    return (
      <Space size={16}>
        <PrimaryButton onClick={() => onAddItemToRequestModalOpen()}>
          <Icon icon="plus" /> {t("Add to Request")}
        </PrimaryButton>
        <PrimaryButton onClick={props.onCleanSelected}>
          <Icon icon="clear" /> {t("Deselect")}
        </PrimaryButton>
        <DeleteButton onClick={() => onItemDelete?.(props.selectedRowKeys)}>
          <Icon icon="delete" /> {t("Delete")}
        </DeleteButton>
      </Space>
    );
  };

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      defaultValue: searchTerm,
      onSearch: (value: string) => {
        if (value) {
          onSearchTerm(value);
        } else {
          onSearchTerm();
        }
      },
    },
  };

  const pagination: TablePaginationConfig = {
    showSizeChanger: true,
    current: page,
    total: totalCount,
    pageSize: pageSize,
  };

  const options = {
    search: true,
    fullScreen: true,
    reload: onItemsReload,
    setting: true,
  };

  return (
    <>
      {contentTableColumns ? (
        <ResizableProTable
          options={options}
          loading={loading}
          pagination={pagination}
          toolbar={handleToolbarEvents}
          dataSource={contentTableFields}
          tableAlertOptionRender={AlertOptions}
          rowSelection={rowSelection}
          columns={[...actionsColumn, ...contentTableColumns]}
          onChange={(pagination, _, sorter: any) => {
            onContentTableChange(
              pagination.current ?? 1,
              pagination.pageSize ?? 10,
              sorter?.order
                ? { type: sorter.columnKey, direction: sorter.order === "ascend" ? "ASC" : "DESC" }
                : undefined,
            );
          }}
        />
      ) : null}
      {selection && (
        <LinkItemRequestModal
          itemIds={selection.selectedRowKeys}
          onChange={onAddItemToRequest}
          onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
          visible={addItemToRequestModalShown}
          linkedRequest={undefined}
          requestList={requests}
        />
      )}
    </>
  );
};

export default ContentTable;

const PrimaryButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeleteButton = styled.a`
  color: #ff7875;
`;
