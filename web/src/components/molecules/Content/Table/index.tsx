// import { LightFilter } from "@ant-design/pro-components";
import styled from "@emotion/styled";
import moment from "moment";
import React, { Key, useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
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
import { useWorkspace } from "@reearth-cms/state";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import DropdownRender from "./DropdownRender";
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
  const [currentWorkspace] = useWorkspace();
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
  const [selectedFilter, setSelectedFilter] = useState<{
    dataIndex: string | string[];
    title: string;
    type: string;
  }>();

  const [isFilter, setIsFilter] = useState(true);
  const [controlMenuOpen, setControlMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [conditionMenuOpen, setConditionMenuOpen] = useState(false);

  const handleControlMenuOpenChange = (open: boolean) => {
    setControlMenuOpen(open);
  };

  const toolBarItemClick = (isFilterMode: boolean) => {
    setInputValue("");
    setItems(getOptions(true));
    setIsFilter(isFilterMode);
    handleOptionsOpenChange(true);
  };

  const handleOptionsOpenChange = (open: boolean) => {
    setControlMenuOpen(false);
    setOptionsOpen(open);
  };

  const handleConditionMenuOpenChange = (open: boolean) => {
    setConditionMenuOpen(open);
  };

  const close = () => {
    setConditionMenuOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const reg = new RegExp(e.target.value, "i");
    const result = getOptions(optionsOpen)?.filter(item => {
      return reg.test((item as any)?.label);
    });
    setItems(result);
  };

  const getOptions = useCallback(
    (isFromMenu: boolean): MenuProps["items"] => {
      const optionsClick = (isFilter: boolean, column: ExtendedColumns) => {
        if (isFilter)
          setFilters(prevState => [
            ...prevState,
            {
              dataIndex: column.dataIndex,
              title: column.title,
              type: column.type,
              members: currentWorkspace?.members,
            },
          ]);
        setSelectedFilter({
          dataIndex: column.dataIndex,
          title: column.title,
          type: column.type,
        } as any);
        handleOptionsOpenChange(false);
        if (isFromMenu) {
          handleConditionMenuOpenChange(true);
        }
      };

      return [
        ...((actionsColumn ?? [])
          .filter(column => !!column.title && typeof column.title === "string")
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionsClick(isFilter, column);
            },
          })) as any),
        ...((contentTableColumns ?? [])
          .filter(column => !!column.title && typeof column.title === "string")
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionsClick(isFilter, column);
            },
          })) as any),
      ];
    },
    [actionsColumn, contentTableColumns, currentWorkspace?.members, isFilter],
  );

  const defaultItems = getOptions(false);
  const [items, setItems] = useState<MenuProps["items"]>(defaultItems);
  const itemFilter = (newFilter: FilterType, index: number) => {
    filterStack.current[index] = newFilter;
    setContentTableFieldsState(filterApply());
  };

  const [inputValue, setInputValue] = useState("");

  const sharedProps = {
    menu: { items },
    dropdownRender: (menu: React.ReactNode): React.ReactNode => (
      <Wrapper>
        <InputWrapper>
          <Input value={inputValue} placeholder="Filter by..." onChange={handleChange} />
        </InputWrapper>
        {React.cloneElement(menu as React.ReactElement, { style: menuStyle })}
      </Wrapper>
    ),
    arrow: true,
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
            <FilterDropdown key={index} filter={filter} itemFilter={itemFilter} index={index} />
          ))}
        </Space>
        <Dropdown
          {...sharedProps}
          placement="bottomLeft"
          trigger={["click"]}
          onOpenChange={() => {
            setIsFilter(true);
            setInputValue("");
            setItems(defaultItems);
          }}>
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

  const toolBarItems: MenuProps["items"] = [
    {
      label: (
        <span
          onClick={() => {
            toolBarItemClick(true);
          }}>
          Add Filter
        </span>
      ),
      key: "filter",
      icon: <Icon icon="filter" />,
    },
    {
      label: (
        <span
          onClick={() => {
            toolBarItemClick(false);
          }}>
          Add Sort
        </span>
      ),
      key: "sort",
      icon: <Icon icon="sortAscending" />,
    },
  ];

  const toolBarRender = () => {
    return [
      <Dropdown
        {...sharedProps}
        placement="bottom"
        trigger={["contextMenu"]}
        open={optionsOpen}
        onOpenChange={handleOptionsOpenChange}
        key="control">
        <Dropdown
          dropdownRender={() =>
            selectedFilter && <DropdownRender filter={selectedFilter} close={close} />
          }
          trigger={["contextMenu"]}
          placement="bottom"
          arrow
          open={conditionMenuOpen}
          onOpenChange={handleConditionMenuOpenChange}>
          <Dropdown
            menu={{ items: toolBarItems }}
            placement="bottom"
            trigger={["click"]}
            arrow
            open={controlMenuOpen}
            onOpenChange={handleControlMenuOpenChange}>
            <Tooltip title="Control">
              <IconWrapper>
                <Icon icon="control" size={18} />
              </IconWrapper>
            </Tooltip>
          </Dropdown>
        </Dropdown>
      </Dropdown>,
    ];
  };

  return (
    <>
      {contentTableColumns ? (
        <ResizableProTable
          options={options}
          loading={loading}
          pagination={pagination}
          toolbar={handleToolbarEvents}
          toolBarRender={toolBarRender}
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

const IconWrapper = styled.span`
  cursor: pointer;
  &:hover {
    color: #40a9ff;
  }
`;

const InputWrapper = styled.div`
  padding: 8px 10px;
`;

const Wrapper = styled.div`
  background-color: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
`;

const menuStyle: React.CSSProperties = {
  boxShadow: "none",
  overflowY: "auto",
};
