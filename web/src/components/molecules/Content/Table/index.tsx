import styled from "@emotion/styled";
import React, { Key, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

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
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { SortDirection, ConditionInput, FieldSelector } from "@reearth-cms/gql/graphql-client-api";
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
  sort?: { field?: FieldSelector; direction?: SortDirection };
  filter?: Omit<ConditionInput, "and" | "or">[];
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
    sorter?: { field?: FieldSelector; direction?: SortDirection },
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
  filter,
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
  onItemDelete,
  onItemsReload,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
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
        dataIndex: "status",
        key: "STATUS",
        render: (_, item) => {
          const itemStatus: StateType[] = item.status.split("_") as StateType[];
          return (
            <>
              {itemStatus.map((state, index) => {
                if (index === itemStatus.length - 1) {
                  return <StyledBadge key={index} color={stateColors[state]} text={t(state)} />;
                } else {
                  return <StyledBadge key={index} color={stateColors[state]} />;
                }
              })}
            </>
          );
        },
        width: 148,
        minWidth: 148,
        type: "STATUS",
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
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
        type: "Date",
      },
      {
        title: t("Updated At"),
        dataIndex: "updatedAt",
        key: "MODIFICATION_DATE",
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        defaultSortOrder:
          sort?.field?.type === "MODIFICATION_DATE"
            ? sort?.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
        type: "Date",
      },
    ],
    [t, sort?.field?.type, sort?.direction, selectedItem?.id, onItemSelect],
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

  const defaultFilterValues = useRef<DefaultFilterValueType[]>([]);

  const [filters, setFilters] = useState<DropdownFilterType[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<DropdownFilterType>();
  const filterRemove = useCallback(
    (index: number) => {
      setFilters(prev => {
        prev.splice(index, 1);
        return prev;
      });
      defaultFilterValues.current.splice(index, 1);
      let params = searchParams.get("filter") ?? "";
      const conditions = params.split(",");
      conditions.splice(index, 1);
      params = conditions.filter(Boolean).join(",");
      searchParams.set("filter", params);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (filter && contentTableColumns) {
      const newFilters: any[] = [];
      const newDefaultValues = [];
      for (const f of filter) {
        const condition = Object.values(f)[0];
        if (!condition) break;
        const { operator, fieldId } = condition;
        const value = "value" in condition ? condition?.value : "";
        const operatorType = Object.keys(f)[0];
        let column;

        const columns: ExtendedColumns[] =
          fieldId.type === "FIELD" || fieldId.type === "CREATION_USER"
            ? contentTableColumns
            : actionsColumn;
        for (const c of columns) {
          if (c.key === fieldId.id) {
            column = c;
            break;
          }
        }
        newFilters.push({
          dataIndex: column?.dataIndex,
          title: column?.title,
          type: column?.type,
          typeProperty: column?.typeProperty,
          members: currentWorkspace?.members,
          id: column?.key,
        });
        newDefaultValues.push({ operatorType, operator, value });
      }
      setFilters(newFilters);
      defaultFilterValues.current = newDefaultValues;
    }
  }, [filter, contentTableColumns, actionsColumn, currentWorkspace?.members]);

  const isFilter = useRef<boolean>(true);
  const [controlMenuOpen, setControlMenuOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [conditionMenuOpen, setConditionMenuOpen] = useState(false);

  const handleControlMenuOpenChange = (open: boolean) => {
    setControlMenuOpen(open);
  };

  const toolBarItemClick = (isFilterMode: boolean) => {
    setInputValue("");
    setItems(getOptions(true));
    isFilter.current = isFilterMode;
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
      const optionClick = (isFilter: boolean, column: ExtendedColumns) => {
        const filter = {
          dataIndex: column.dataIndex,
          title: column.title,
          type: column.type,
          typeProperty: column.typeProperty,
          members: currentWorkspace?.members,
          id: column.key,
        };
        if (isFilter) {
          setFilters(prevState => [...prevState, filter] as any);
        }
        setSelectedFilter(filter as any);
        handleOptionsOpenChange(false);
        if (isFromMenu) {
          handleConditionMenuOpenChange(true);
        }
      };

      return [
        ...((actionsColumn ?? [])
          .filter(column => column.key === "CREATION_DATE" || column.key === "MODIFICATION_DATE")
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionClick(isFilter.current, column);
            },
          })) as any),
        ...((contentTableColumns ?? [])
          .filter(column => !!column.title && typeof column.title === "string")
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionClick(isFilter.current, column);
            },
          })) as any),
      ];
    },
    [actionsColumn, contentTableColumns, currentWorkspace?.members],
  );

  const defaultItems = getOptions(false);
  const [items, setItems] = useState<MenuProps["items"]>(defaultItems);

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
    search: (
      <StyledSearchContainer>
        <StyledSearchInput
          placeholder={t("Please enter")}
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
            {filters.map((filter, index) => (
              <FilterDropdown
                key={index}
                filter={filter}
                defaultValue={defaultFilterValues.current[index]}
                index={index}
                filterRemove={filterRemove}
              />
            ))}
          </StyledFilterSpace>
          <Dropdown
            {...sharedProps}
            placement="bottomLeft"
            trigger={["click"]}
            onOpenChange={() => {
              isFilter.current = true;
              setInputValue("");
              setItems(defaultItems);
            }}>
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
            selectedFilter && (
              <DropdownRender
                filter={selectedFilter}
                close={close}
                index={filters.length - 1}
                open={conditionMenuOpen}
                isFilter={isFilter.current}
              />
            )
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
          dataSource={contentTableFields}
          tableAlertOptionRender={AlertOptions}
          rowSelection={rowSelection}
          columns={[...actionsColumn, ...contentTableColumns]}
          onChange={(pagination, _, sorter: any) => {
            onContentTableChange(
              pagination.current ?? 1,
              pagination.pageSize ?? 10,
              sorter?.order
                ? {
                    field: { type: sorter.columnKey },
                    direction: sorter.order === "ascend" ? SortDirection.Asc : SortDirection.Desc,
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

const stateColors: {
  [K in StateType]: ColorType;
} = {
  DRAFT: "#BFBFBF",
  PUBLIC: "#52C41A",
  REVIEW: "#FA8C16",
};
