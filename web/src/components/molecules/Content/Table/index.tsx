// import { LightFilter } from "@ant-design/pro-components";
import styled from "@emotion/styled";
import moment from "moment";
import { Key, useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import {
  ColorType,
  StateType,
  FilterType,
  FilterOptions,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  ItemSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { useT } from "@reearth-cms/i18n";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import FilterDropdown from "./filterDropdown";

type ExtendedColumns = ProColumns<ContentTableField> & {
  type?: string;
  typeProperty?: { values?: string[] };
};

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ExtendedColumns[];
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
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
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
  const actionsColumn: ExtendedColumns[] = useMemo(
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
        dataIndex: "itemRequestState",
        key: "itemRequestState",
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
        type: "Status",
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
        type: "Date",
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
        type: "Date",
      },
    ],
    [t, onItemSelect, sort?.direction, sort?.type, selectedItem?.id],
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

  const filterStack = useRef<FilterType[]>([]);

  const filterApply = useCallback(() => {
    let result = contentTableFields;
    for (const filter of filterStack.current) {
      if (!filter) continue;
      const { dataIndex, option, value } = filter;
      result = result?.filter(field => {
        const data =
          dataIndex === "itemRequestState"
            ? "status"
            : typeof dataIndex === "string"
            ? (field as any)[dataIndex]
            : (field as any)[dataIndex[0]][dataIndex[1]];

        let dataTime = 0;
        let valueTime = 0;
        if (
          FilterOptions.DateIs ||
          option === FilterOptions.DateIsNot ||
          option === FilterOptions.Before ||
          option === FilterOptions.After
        ) {
          dataTime = new Date(data).setHours(9, 0, 0, 0);
          valueTime = new Date(value).getTime();
        }

        switch (option) {
          case FilterOptions.Is:
            return data === value;
          case FilterOptions.IsNot:
            return data !== value;
          case FilterOptions.Contains:
            return new RegExp(value).test(data);
          case FilterOptions.NotContain:
            return new RegExp(`^(?!.*${value}).*$`).test(data);
          case FilterOptions.IsEmpty:
            return data === null;
          case FilterOptions.IsNotEmpty:
            return data !== null;
          case FilterOptions.GreaterThan:
            return data !== null && data >= value;
          case FilterOptions.LessThan:
            return data !== null && data <= value;
          case FilterOptions.DateIs:
            return dataTime === valueTime;
          case FilterOptions.DateIsNot:
            return dataTime !== valueTime;
          case FilterOptions.Before:
            return dataTime < valueTime;
          case FilterOptions.After:
            return dataTime > valueTime;
          case FilterOptions.OfThisWeek:
            return (
              moment(dataTime).year() === moment(valueTime).year() &&
              moment(dataTime).week() === moment(valueTime).week()
            );
          case FilterOptions.OfThisMonth:
            return (
              moment(dataTime).year() === moment(valueTime).year() &&
              moment(dataTime).month() === moment(valueTime).month()
            );
          case FilterOptions.OfThisYear:
            return moment(dataTime).year() === moment(valueTime).year();
        }
      });
    }
    return result;
  }, [contentTableFields]);

  const [contentTableFieldsState, setContentTableFieldsState] = useState<ContentTableField[]>();

  useEffect(() => {
    setContentTableFieldsState(filterApply());
  }, [filterApply]);

  const [filters, setFilters] = useState<any[]>([]);

  const [items, setItems] = useState<MenuProps["items"]>();

  const defaultItems: MenuProps["items"] = useMemo(() => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const reg = new RegExp(value, "i");
      const result = defaultItems?.filter(item => {
        return item?.key == "0" || reg.test((item as any)?.label);
      });
      setItems(result);
    };

    return [
      {
        key: "0",
        label: <Input placeholder={t("Filter by...")} onChange={handleChange} />,
        disabled: true,
      },
      ...((actionsColumn ?? [])
        .filter(column => !!column.title && typeof column.title === "string")
        .map(column => ({
          key: column.key,
          label: column.title,
          onClick: () => {
            setFilters(prevState => [
              ...prevState,
              { dataIndex: column.dataIndex, title: column.title, type: column.type },
            ]);
          },
        })) as any),
      ...((contentTableColumns ?? [])
        .filter(column => !!column.title && typeof column.title === "string")
        .map(column => ({
          key: column.key,
          label: column.title,
          onClick: () => {
            setFilters(prevState => [
              ...prevState,
              {
                dataIndex: column.dataIndex,
                title: column.title,
                type: column.type,
                typeProperty: column.typeProperty,
              },
            ]);
          },
        })) as any),
    ];
  }, [actionsColumn, contentTableColumns, t]);

  useEffect(() => {
    setItems(defaultItems);
  }, [defaultItems]);

  const itemFilter = (newFilter: FilterType, index: number) => {
    filterStack.current[index] = newFilter;
    setContentTableFieldsState(filterApply());
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
    filter: (
      <StyledLightFilter>
        <Space
          size={[0, 8]}
          style={{ maxWidth: 700, overflowX: "auto", marginTop: 0, paddingRight: 10 }}>
          {filters.map((filter, index) => (
            <FilterDropdown
              key={filter.title}
              filter={filter}
              itemFilter={itemFilter}
              index={index}
            />
          ))}
        </Space>
        <Dropdown menu={{ items }} placement="bottomLeft" trigger={["click"]} arrow>
          <Button type="text" style={{ color: "rgba(0, 0, 0, 0.25)" }} icon={<Icon icon="plus" />}>
            Filter
          </Button>
        </Dropdown>
      </StyledLightFilter>
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
          dataSource={contentTableFieldsState}
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

const StyledLightFilter = styled.div`
  display: flex;
  text-align: left;
  ant-space {
    flex: 1;
    align-self: start;
    justify-self: start;
    text-align: start;
  }
  .ant-pro-form-light-filter-item {
    margin: 0;
  }
`;
