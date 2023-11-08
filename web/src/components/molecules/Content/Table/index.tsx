import { ColumnsState } from "@ant-design/pro-table";
import styled from "@emotion/styled";
import React, {
  Key,
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
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
  DefaultFilterValueType,
  DropdownFilterType,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import {
  SortDirection,
  FieldSelector,
  FieldType,
  ItemSortInput,
  ConditionInput,
} from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import DropdownRender from "./DropdownRender";
import FilterDropdown from "./filterDropdown";

type ExtendedColumns = ProColumns<ContentTableField> & {
  type?: FieldType | "Person";
  fieldType?: string;
  sortOrder?: "descend" | "ascend" | null;
  typeProperty?: { values?: string[] };
  required?: boolean;
  multiple?: boolean;
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
  currentView: CurrentViewType;
  setCurrentView: Dispatch<SetStateAction<CurrentViewType>>;
  searchTerm: string;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onSearchTerm: (term?: string) => void;
  onTableControl: (sort: ItemSortInput | undefined, filter: ConditionInput[] | undefined) => void;
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
  currentView,
  searchTerm,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  setCurrentView,
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
  onTableControl,
  onContentTableChange,
  onItemSelect,
  setSelection,
  onItemDelete,
  onItemsReload,
}) => {
  const [currentWorkspace] = useWorkspace();
  const t = useT();

  const actionsColumns: ExtendedColumns[] | undefined = useMemo(
    () => [
      {
        render: (_, contentField) => (
          <Link to={`details/${contentField.id}`}>
            <Icon icon="edit" />
          </Link>
        ),
        hideInSetting: true,
        dataIndex: "editIcon",
        fieldType: "EDIT_ICON",
        key: "EDIT_ICON",
        width: 48,
        minWidth: 48,
        ellipsis: true,
      },
      {
        title: () => <Icon icon="message" />,
        hideInSetting: true,
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
        ellipsis: true,
      },
      {
        title: t("Status"),
        dataIndex: "Status",
        fieldType: "STATUS",
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
        ellipsis: true,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        fieldType: "CREATION_DATE",
        key: "CREATION_DATE",
        sortOrder:
          currentView.sort?.field?.type === "CREATION_DATE"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        render: (_, item) => dateTimeFormat(item.createdAt),
        sorter: true,
        defaultSortOrder:
          currentView.sort?.field?.type === "CREATION_DATE"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
        ellipsis: true,
        // type: "Date",
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        fieldType: "CREATION_USER",
        key: "CREATION_USER",
        sortOrder:
          currentView.sort?.field?.type === "CREATION_USER"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        sorter: true,
        defaultSortOrder:
          currentView.sort?.field?.type === "CREATION_USER"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
        type: "Person",
        ellipsis: true,
      },
      {
        title: t("Updated At"),
        dataIndex: "updatedAt",
        fieldType: "MODIFICATION_DATE",
        key: "MODIFICATION_DATE",
        sortOrder:
          currentView.sort?.field?.type === "MODIFICATION_DATE"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        defaultSortOrder:
          currentView.sort?.field?.type === "MODIFICATION_DATE"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
        ellipsis: true,
        // type: "Date",
      },
      {
        title: t("Updated By"),
        dataIndex: "updatedBy",
        fieldType: "MODIFICATION_USER",
        key: "MODIFICATION_USER",
        sortOrder:
          currentView.sort?.field?.type === "MODIFICATION_USER"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        sorter: true,
        defaultSortOrder:
          currentView.sort?.field?.type === "MODIFICATION_USER"
            ? currentView.sort.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        width: 148,
        minWidth: 148,
        type: "Person",
        ellipsis: true,
      },
    ],
    [t, currentView.sort, selectedItem?.id, onItemSelect],
  );

  const contentColumns: ExtendedColumns[] | undefined = useMemo(
    () =>
      contentTableColumns?.map(column => ({
        sorter: true,
        sortOrder:
          currentView.sort?.field?.id === column.key
            ? currentView.sort?.direction === "ASC"
              ? "ascend"
              : "descend"
            : null,
        key: column.key,
        fieldType: column.fieldType,
        title: column.title,
        dataIndex: column.dataIndex,
        width: 128,
        minWidth: 128,
        ellipsis: true,
        multiple: column.multiple,
        required: column.required,
      })),
    [contentTableColumns, currentView.sort],
  );

  const tableColumns = useMemo(() => {
    const items = [...actionsColumns];
    if (contentColumns) items.push(...contentColumns);
    return items;
  }, [actionsColumns, contentColumns]);

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
      const currentFilters = currentView.filter ? [...currentView.filter.conditions] : [];
      currentFilters.splice(index, 1);
      onTableControl(undefined, currentFilters);
    },
    [currentView.filter, onTableControl],
  );

  useEffect(() => {
    if (currentView.filter && contentTableColumns) {
      const newFilters: any[] = [];
      const newDefaultValues = [];
      for (const c of currentView.filter.conditions) {
        const condition = Object.values(c)[0];
        if (!condition) break;
        const { operator, fieldId } = condition as any;
        const value = "value" in condition ? condition?.value : "";
        const operatorType = Object.keys(c)[0];
        let column;

        const columns: ExtendedColumns[] =
          fieldId.type === "FIELD" || fieldId.type === "META_FIELD"
            ? contentTableColumns
            : actionsColumns;
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
    } else {
      setFilters([]);
      defaultFilterValues.current = [];
    }
    isFilterOpen.current = false;
  }, [currentView.filter, contentTableColumns, actionsColumns, currentWorkspace?.members]);

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

  const isFilterOpen = useRef(false);

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
          required: column.required,
          multiple: column.multiple,
        };
        if (isFilter) {
          setFilters(prevState => [...prevState, filter] as any);
        }
        setSelectedFilter(filter as any);
        handleOptionsOpenChange(false);
        if (isFromMenu) {
          handleConditionMenuOpenChange(true);
          isFilterOpen.current = false;
        } else {
          isFilterOpen.current = true;
        }
      };

      return [
        // TODO: Uncomment this when we have a way to filter by creation/modification date
        // ...((actionsColumns ?? [])
        //   .filter(column => column.key === "CREATION_DATE" || column.key === "MODIFICATION_DATE")
        //   .map(column => ({
        //     key: column.key,
        //     label: column.title,
        //     onClick: () => {
        //       optionClick(isFilter.current, column);
        //     },
        //   })) as any),
        ...((contentTableColumns ?? [])
          .filter(
            column =>
              (column.type as string) !== "Group" && (column.type as string) !== "Reference",
          )
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionClick(isFilter.current, column);
            },
          })) as any),
      ];
    },
    [/*actionsColumns,*/ contentTableColumns, currentWorkspace?.members],
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
                isFilterOpen={isFilterOpen.current}
                currentView={currentView}
                onTableControl={onTableControl}
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
                currentView={currentView}
                onTableControl={onTableControl}
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

  const settingOptions = useMemo(() => {
    const shownCols = currentView.columns?.map(col => {
      switch (col.type as string) {
        case "ID":
        case "STATUS":
        case "CREATION_DATE":
        case "CREATION_USER":
        case "MODIFICATION_DATE":
        case "MODIFICATION_USER":
          return col.type as string;
        default:
          return col.id as string;
      }
    });
    const settingOptions: Record<string, ColumnsState> = {};
    tableColumns.forEach(col => {
      if (
        shownCols?.includes(col.key as string) ||
        (col.key as string) === "commentsCount" ||
        (col.key as string) === "EDIT_ICON" ||
        shownCols?.length === 0
      )
        settingOptions[col.key as string] = {
          show: true,
        };
      else
        settingOptions[col.key as string] = {
          show: false,
        };
    });

    return settingOptions;
  }, [currentView.columns, tableColumns]);

  const setSettingOptions = useCallback(
    (settingOptions: Record<string, ColumnsState>) => {
      const hiddenCols: string[] = [];
      for (const key in settingOptions) {
        if (settingOptions[key].show === false) hiddenCols.push(key);
      }
      const cols: FieldSelector[] = tableColumns
        .filter(col => {
          if ((col.key as string) === "EDIT_ICON" || (col.key as string) === "commentsCount")
            return false;
          if (hiddenCols.includes(col.key as string)) return false;
          else return true;
        })
        .map(col => {
          switch (col.key as string) {
            case "ID":
            case "STATUS":
            case "CREATION_DATE":
            case "CREATION_USER":
            case "MODIFICATION_DATE":
            case "MODIFICATION_USER":
              return {
                type: col.key,
                id: "",
              } as FieldSelector;
            default:
              if ((col.fieldType as string) === "FIELD")
                return {
                  type: FieldType["Field"],
                  id: col.key,
                } as FieldSelector;
              else
                return {
                  type: FieldType["MetaField"],
                  id: col.key,
                } as FieldSelector;
          }
        });
      setCurrentView(prev => ({
        ...prev,
        columns: cols,
      }));
    },
    [setCurrentView, tableColumns],
  );

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
          columns={tableColumns}
          columnsState={{
            value: settingOptions,
            onChange: setSettingOptions,
          }}
          onChange={(pagination, _, sorter: any) => {
            onContentTableChange(
              pagination.current ?? 1,
              pagination.pageSize ?? 10,
              sorter?.order
                ? {
                    field: {
                      id: sorter?.columnKey,
                      type: sorter.column.fieldType as FieldSelector["type"],
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
