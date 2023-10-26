// import { LightFilter } from "@ant-design/pro-components";
import styled from "@emotion/styled";
import { Key, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Badge from "@reearth-cms/components/atoms/Badge";
import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import {
  ProColumns,
  TableRowSelection,
  TablePaginationConfig,
  ListToolBarProps,
} from "@reearth-cms/components/atoms/ProTable";
import Space from "@reearth-cms/components/atoms/Space";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import { ColorType, StateType } from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { SortDirection, FieldSelectorInput } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import FilterDropdown from "./filterDropdown";

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
  sort?: { field?: FieldSelectorInput; direction?: SortDirection };
  searchTerm: string;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onSearchTerm: (term?: string) => void;
  onContentTableChange: (
    page: number,
    pageSize: number,
    sorter?: { field?: FieldSelectorInput; direction?: SortDirection },
  ) => void;
  onItemSelect: (itemId: string) => void;
  setSelection: (input: { selectedRowKeys: string[] }) => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onUnpublish: (itemIds: string[]) => Promise<void>;
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
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onUnpublish,
  onSearchTerm,
  onContentTableChange,
  onItemSelect,
  setSelection,
  // onItemEdit,
  onItemDelete,
  onItemsReload,
}) => {
  const t = useT();
  const actionsColumn: ProColumns<ContentTableField>[] = useMemo(
    () => [
      {
        render: (_, contentField) => (
          <Link to={`details/${contentField.id}`}>
            <Icon icon="edit" />
          </Link>
        ),
        width: 48,
        minWidth: 48,
      },
      {
        title: () => <Icon icon="message" />,
        dataIndex: "commentsCount",
        fieldType: "commentsCount",
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
        title: t("Status"),
        dataIndex: "Status",
        fieldType: "STATUS",
        key: "STATUS",
        render: (_, item) => {
          const stateColors = { DRAFT: "#BFBFBF", PUBLIC: "#52C41A", REVIEW: "#FA8C16" };
          const itemStatus: StateType[] = item.status.split("_") as StateType[];
          return (
            <>
              {itemStatus.map((state, index) => {
                if (index === itemStatus.length - 1) {
                  return (
                    <StyledBadge
                      key={index}
                      color={stateColors[state] as ColorType}
                      text={t(state)}
                    />
                  );
                } else {
                  return <StyledBadge key={index} color={stateColors[state] as ColorType} />;
                }
              })}
            </>
          );
        },
        width: 148,
        minWidth: 148,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        fieldType: "CREATION_DATE",
        key: "CREATION_DATE",
        render: (_, item) => dateTimeFormat(item.createdAt),
        sorter: true,
        defaultSortOrder:
          sort?.field?.type === "CREATION_DATE"
            ? sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        fieldType: "CREATION_USER",
        key: "CREATION_USER",
        sorter: true,
        defaultSortOrder:
          sort?.field?.type === "CREATION_USER"
            ? sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
      },
      {
        title: t("Updated At"),
        dataIndex: "updatedAt",
        fieldType: "MODIFICATION_DATE",
        key: "MODIFICATION_DATE",
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        defaultSortOrder:
          sort?.field?.type === "MODIFICATION_DATE"
            ? sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
      },
      {
        title: t("Updated By"),
        dataIndex: "updatedBy",
        fieldType: "MODIFICATION_USER",
        key: "MODIFICATION_USER",
        sorter: true,
        defaultSortOrder:
          sort?.field?.type === "MODIFICATION_USER"
            ? sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
      },
    ],
    [t, sort?.field?.type, sort?.direction, selectedItem?.id, onItemSelect],
  );

  const contentColumn: ProColumns<ContentTableField>[] | undefined = useMemo(
    () =>
      contentTableColumns?.map(column => ({
        sorter: true,
        key: column.key,
        fieldType: column.fieldType,
        title: column.title,
        dataIndex: column.dataIndex,
        width: 128,
        minWidth: 128,
        ellipsis: true,
      })),
    [contentTableColumns],
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
        <PrimaryButton onClick={() => onUnpublish(props.selectedRowKeys)}>
          <Icon icon="eyeInvisible" /> {t("Unpublish")}
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

  const [filters, setFilters] = useState<any[]>([]);

  const items: MenuProps["items"] = useMemo(
    () => [
      {
        key: "0",
        label: <Input placeholder={t("Filter by...")} />,
        disabled: true,
      },
      ...((actionsColumn ?? [])
        .filter(column => !!column.title && typeof column.title === "string")
        .map(column => ({
          key: column.key,
          label: column.title,
          onClick: () => {
            setFilters(prevState => [...prevState, column.title]);
          },
        })) as any),
      ...((contentTableColumns ?? [])
        .filter(column => !!column.title && typeof column.title === "string")
        .map(column => ({
          key: column.key,
          label: column.title,
          onClick: () => {
            setFilters(prevState => [...prevState, column.title]);
          },
        })) as any),
    ],
    [actionsColumn, contentTableColumns, t],
  );

  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: (
      <StyledSearchContainer>
        <StyledSearchInput
          placeholder={t("Search")}
          defaultValue={searchTerm}
          onSearch={(value: string) => {
            if (value) {
              onSearchTerm(value);
            } else {
              onSearchTerm();
            }
          }}
        />
        <StyledFilterWrapper>
          <StyledFilterSpace size={[0, 8]}>
            {filters.map(filter => (
              <FilterDropdown key={filter} filter={filter} />
            ))}
          </StyledFilterSpace>
          <Dropdown menu={{ items }} placement="bottomLeft" trigger={["click"]} arrow>
            <StyledFilterButton type="text" icon={<Icon icon="plus" />}>
              Filter
            </StyledFilterButton>
          </Dropdown>
        </StyledFilterWrapper>
      </StyledSearchContainer>
    ),
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
    // edit here
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
          columns={[...actionsColumn, ...contentColumn]}
          onChange={(pagination, _, sorter: any) => {
            console.log("sorter", sorter);
            onContentTableChange(
              pagination.current ?? 1,
              pagination.pageSize ?? 10,
              sorter?.order
                ? {
                    field: {
                      id: sorter?.columnKey,
                      type: sorter.column.fieldType as FieldSelectorInput["type"],
                    },
                    direction:
                      sorter.order === "ascend"
                        ? ("ASC" as SortDirection)
                        : ("DESC" as SortDirection),
                  }
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
          onRequestTableChange={onRequestTableChange}
          requestModalLoading={requestModalLoading}
          requestModalTotalCount={requestModalTotalCount}
          requestModalPage={requestModalPage}
          requestModalPageSize={requestModalPageSize}
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

const StyledBadge = styled(Badge)`
  + * {
    margin-left: 4px;
  }
`;

const StyledSearchContainer = styled.div`
  display: flex;
`;

const StyledSearchInput = styled(Input.Search)`
  min-width: 200px;
`;

const StyledFilterSpace = styled(Space)`
  max-width: 750px;
  overflow-x: auto;
  margin-top: 0;
`;

const StyledFilterButton = styled(Button)`
  color: rgba(0, 0, 0, 0.25);
`;

const StyledFilterWrapper = styled.div`
  display: flex;
  text-align: left;
  ant-space {
    flex: 1;
    align-self: start:
    justify-self: start;
    text-align: start;
  }
  .ant-pro-form-light-filter-item {
    margin: 0;
  }
`;
