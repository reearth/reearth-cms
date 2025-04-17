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

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import {
  TableRowSelection,
  ListToolBarProps,
  ColumnsState,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import UserAvatar from "@reearth-cms/components/atoms/UserAvatar";
import ResizableProTable from "@reearth-cms/components/molecules/Common/ResizableProTable";
import LinkItemRequestModal from "@reearth-cms/components/molecules/Content/LinkItemRequestModal/LinkItemRequestModal";
import Status from "@reearth-cms/components/molecules/Content/Status";
import {
  DefaultFilterValueType,
  DropdownFilterType,
  ExtendedColumns,
} from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request, RequestItem } from "@reearth-cms/components/molecules/Request/types";
import {
  ItemSort,
  FieldType,
  Column,
  ConditionInput,
  CurrentView,
  metaColumn,
} from "@reearth-cms/components/molecules/View/types";
import { useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";
import { dateTimeFormat } from "@reearth-cms/utils/format";

import DropdownRender from "./DropdownRender";
import FilterDropdown from "./filterDropdown";

type Props = {
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ExtendedColumns[];
  loading: boolean;
  deleteLoading: boolean;
  publishLoading: boolean;
  unpublishLoading: boolean;
  selectedItem?: Item;
  selectedItems: { selectedRows: { itemId: string; version?: string }[] };
  totalCount: number;
  currentView: CurrentView;
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
  searchTerm: string;
  page: number;
  pageSize: number;
  requestModalLoading: boolean;
  requestModalTotalCount: number;
  requestModalPage: number;
  requestModalPageSize: number;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onSearchTerm: (term?: string) => void;
  onFilterChange: (filter?: ConditionInput[]) => void;
  onContentTableChange: (page: number, pageSize: number, sorter?: ItemSort) => void;
  onItemSelect: (itemId: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: ContentTableField[]) => void;
  onItemEdit: (itemId: string) => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onPublish: (itemIds: string[]) => Promise<void>;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  onItemsReload: () => void;
  requests: Request[];
  addItemToRequestModalShown: boolean;
  onAddItemToRequest: (request: Request, items: RequestItem[]) => Promise<void>;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  modelKey?: string;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableReload: () => void;
  hasDeleteRight: boolean;
  hasPublishRight: boolean;
  hasRequestUpdateRight: boolean;
  showPublishAction: boolean;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  deleteLoading,
  publishLoading,
  unpublishLoading,
  selectedItem,
  selectedItems,
  totalCount,
  currentView,
  page,
  pageSize,
  requests,
  addItemToRequestModalShown,
  setCurrentView,
  searchTerm,
  onRequestTableChange,
  requestModalLoading,
  requestModalTotalCount,
  requestModalPage,
  requestModalPageSize,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onPublish,
  onUnpublish,
  onSearchTerm,
  onFilterChange,
  onContentTableChange,
  onItemSelect,
  onSelect,
  onItemEdit,
  onItemDelete,
  onItemsReload,
  modelKey,
  onRequestSearchTerm,
  onRequestTableReload,
  hasDeleteRight,
  hasPublishRight,
  hasRequestUpdateRight,
  showPublishAction,
}) => {
  const [currentWorkspace] = useWorkspace();
  const t = useT();

  const sortOrderGet = useCallback(
    (key: FieldType) =>
      currentView.sort?.field.type === key
        ? currentView.sort.direction === "ASC"
          ? "ascend"
          : "descend"
        : null,
    [currentView?.sort?.direction, currentView.sort?.field.type],
  );

  const actionsColumns: ExtendedColumns[] = useMemo(
    () => [
      {
        title: "",
        hideInSetting: true,
        render: (_, contentField) => (
          <Icon icon="edit" color={"#1890ff"} onClick={() => onItemEdit(contentField.id)} />
        ),
        dataIndex: "editIcon",
        fieldType: "EDIT_ICON",
        key: "EDIT_ICON",
        width: 48,
        minWidth: 48,
        ellipsis: true,
        align: "center",
      },
      {
        title: () => <Icon icon="message" />,
        hideInSetting: true,
        dataIndex: "commentsCount",
        fieldType: "commentsCount",
        key: "commentsCount",
        render: (_, item) => {
          return (
            <StyledButton type="link" onClick={() => onItemSelect(item.id)}>
              <CustomTag
                value={item.comments?.length || 0}
                color={item.id === selectedItem?.id ? "#87e8de" : undefined}
              />
            </StyledButton>
          );
        },
        width: 48,
        minWidth: 48,
        align: "center",
      },
      {
        title: t("Status"),
        dataIndex: "Status",
        fieldType: "STATUS",
        key: "STATUS",
        render: (_, item) => <Status status={item.status} />,
        width: 148,
        minWidth: 148,
      },
      {
        title: t("Created At"),
        dataIndex: "createdAt",
        fieldType: "CREATION_DATE",
        key: "CREATION_DATE",
        sortOrder: sortOrderGet("CREATION_DATE"),
        render: (_, item) => dateTimeFormat(item.createdAt),
        sorter: true,
        defaultSortOrder: sortOrderGet("CREATION_DATE"),
        width: 148,
        minWidth: 148,
        ellipsis: true,
        type: "Date",
      },
      {
        title: t("Created By"),
        dataIndex: "createdBy",
        fieldType: "CREATION_USER",
        key: "CREATION_USER",
        sortOrder: sortOrderGet("CREATION_USER"),
        render: (_, item) => (
          <Space>
            <UserAvatar username={item.createdBy.name} size={"small"} />
            {item.createdBy.name}
          </Space>
        ),
        sorter: true,
        defaultSortOrder: sortOrderGet("CREATION_USER"),
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
        sortOrder: sortOrderGet("MODIFICATION_DATE"),
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        defaultSortOrder: sortOrderGet("MODIFICATION_DATE"),
        width: 148,
        minWidth: 148,
        ellipsis: true,
        type: "Date",
      },
      {
        title: t("Updated By"),
        dataIndex: "updatedBy",
        fieldType: "MODIFICATION_USER",
        key: "MODIFICATION_USER",
        sortOrder: sortOrderGet("MODIFICATION_USER"),
        render: (_, item) =>
          item.updatedBy ? (
            <Space>
              <UserAvatar username={item.updatedBy} size={"small"} />
              {item.updatedBy}
            </Space>
          ) : (
            "-"
          ),
        sorter: true,
        defaultSortOrder: sortOrderGet("MODIFICATION_USER"),
        width: 148,
        minWidth: 148,
        type: "Person",
        ellipsis: true,
      },
    ],
    [t, sortOrderGet, onItemEdit, selectedItem?.id, onItemSelect],
  );

  const tableColumns = useMemo(() => {
    return contentTableColumns ? [...actionsColumns, ...contentTableColumns] : [...actionsColumns];
  }, [actionsColumns, contentTableColumns]);

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedItems.selectedRows.map(item => item.itemId),
      onChange: onSelect,
    }),
    [onSelect, selectedItems.selectedRows],
  );

  const publishConfirm = useCallback(
    (itemIds: string[]) => {
      Modal.confirm({
        title: t("Publish items"),
        content: t("All selected items will be published. You can unpublish them anytime."),
        icon: <Icon icon="exclamationCircle" />,
        cancelText: t("No"),
        okText: t("Yes"),
        async onOk() {
          await onPublish(itemIds);
        },
      });
    },
    [onPublish, t],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      return (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<Icon icon="upload" />}
            onClick={() => {
              publishConfirm(props.selectedRowKeys);
            }}
            loading={publishLoading}
            disabled={!hasPublishRight || !showPublishAction}>
            {t("Publish")}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Icon icon="plus" />}
            onClick={() => onAddItemToRequestModalOpen()}
            disabled={!hasRequestUpdateRight}>
            {t("Add to Request")}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Icon icon="eyeInvisible" />}
            onClick={() => onUnpublish(props.selectedRowKeys)}
            loading={unpublishLoading}
            disabled={!hasPublishRight}>
            {t("Unpublish")}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Icon icon="delete" />}
            onClick={() => onItemDelete(props.selectedRowKeys)}
            danger
            loading={deleteLoading}
            disabled={!hasDeleteRight}>
            {t("Delete")}
          </Button>
        </Space>
      );
    },
    [
      deleteLoading,
      hasDeleteRight,
      hasPublishRight,
      hasRequestUpdateRight,
      onAddItemToRequestModalOpen,
      onItemDelete,
      onUnpublish,
      publishConfirm,
      publishLoading,
      showPublishAction,
      t,
      unpublishLoading,
    ],
  );

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
      const currentFilters =
        currentView.filter && currentView.filter.and ? [...currentView.filter.and.conditions] : [];
      currentFilters.splice(index, 1);
      onFilterChange(currentFilters.length > 0 ? currentFilters : undefined);
    },
    [currentView.filter, onFilterChange],
  );

  useEffect(() => {
    if (currentView.filter && currentView.filter.and && contentTableColumns) {
      const newFilters: DropdownFilterType[] = [];
      const newDefaultValues: DefaultFilterValueType[] = [];
      for (const c of currentView.filter.and.conditions) {
        const condition = Object.values(c)[0];
        if (!condition || !("operator" in condition)) break;
        const { operator, fieldId } = condition;
        const value = "value" in condition ? (condition.value as string) : "";
        const operatorType = Object.keys(c)[0];
        const columns =
          fieldId.type === "FIELD" || fieldId.type === "META_FIELD"
            ? contentTableColumns
            : actionsColumns;
        const column = columns.find(c => c.key === fieldId.id);
        if (column) {
          const { dataIndex, title, type, typeProperty, key, required, multiple } = column;
          const members = currentWorkspace?.members;
          if (
            dataIndex &&
            title &&
            type &&
            typeProperty &&
            key &&
            required !== undefined &&
            multiple !== undefined &&
            members
          ) {
            newFilters.push({
              dataIndex: dataIndex as string | string[],
              title: title as string,
              type,
              typeProperty,
              members,
              id: key as string,
              required,
              multiple,
            });
            newDefaultValues.push({ operatorType, operator, value });
          }
        }
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

  const handleControlMenuOpenChange = useCallback((open: boolean) => {
    setControlMenuOpen(open);
  }, []);

  const handleOptionsOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setOptionsOpen(false);
    }
  }, []);

  const handleConditionMenuOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setConditionMenuOpen(false);
    }
  }, []);

  const close = useCallback(() => {
    setConditionMenuOpen(false);
  }, []);

  const getOptions = useCallback(
    (isFromMenu: boolean): MenuProps["items"] => {
      const optionClick = (isFilter: boolean, column: ExtendedColumns) => {
        const { dataIndex, title, type, typeProperty, key, required, multiple } = column;
        const members = currentWorkspace?.members;
        if (
          dataIndex &&
          title &&
          type &&
          typeProperty &&
          key &&
          required !== undefined &&
          multiple !== undefined &&
          members
        ) {
          const filter: DropdownFilterType = {
            dataIndex: dataIndex as string | string[],
            title: title as string,
            type,
            typeProperty,
            members,
            id: key as string,
            required,
            multiple,
          };
          if (isFilter) {
            setFilters(prevState => [...prevState, filter]);
          }
          setSelectedFilter(filter);
          handleOptionsOpenChange(false);
          if (isFromMenu) {
            setConditionMenuOpen(true);
            isFilterOpen.current = false;
          } else {
            isFilterOpen.current = true;
          }
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
            column => column.type !== "Group" && column.type !== "Reference" && !column.multiple,
          )
          .map(column => ({
            key: column.key,
            label: column.title,
            onClick: () => {
              optionClick(isFilter.current, column);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })) as any),
      ];
    },
    [contentTableColumns, currentWorkspace?.members, handleOptionsOpenChange],
  );

  const toolBarItemClick = useCallback(
    ({ key }: { key: string }) => {
      setInputValue("");
      setItems(getOptions(true));
      isFilter.current = key === "filter";
      setControlMenuOpen(false);
      setOptionsOpen(true);
    },
    [getOptions],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      const reg = new RegExp(e.target.value, "i");
      const result = getOptions(optionsOpen)?.filter(item => {
        if (item && "label" in item && typeof item.label === "string") {
          return reg.test(item.label);
        }
      });
      setItems(result);
    },
    [getOptions, optionsOpen],
  );

  const isFilterOpen = useRef(false);
  const defaultItems = getOptions(false);
  const [items, setItems] = useState<MenuProps["items"]>(defaultItems);
  const [inputValue, setInputValue] = useState("");

  const sharedProps = useMemo(
    () => ({
      menu: { items },
      dropdownRender: (menu: React.ReactNode) => (
        <Wrapper>
          <InputWrapper>
            <Input
              value={inputValue}
              placeholder={isFilter.current ? "Filter by..." : "Sort by..."}
              onChange={handleChange}
            />
          </InputWrapper>
          {React.cloneElement(menu as React.ReactElement)}
        </Wrapper>
      ),
      arrow: false,
    }),
    [handleChange, inputValue, items],
  );

  const handleToolbarEvents: ListToolBarProps = useMemo(
    () => ({
      search: (
        <StyledSearchContainer>
          <Search
            allowClear
            placeholder={t("input search text")}
            onSearch={(value: string) => {
              onSearchTerm(value);
            }}
            defaultValue={searchTerm}
            key={`${modelKey}${currentView.id}`}
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
                  setCurrentView={setCurrentView}
                  onFilterChange={onFilterChange}
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
                {t("Filter")}
              </StyledFilterButton>
            </Dropdown>
          </StyledFilterWrapper>
        </StyledSearchContainer>
      ),
    }),
    [
      currentView,
      defaultItems,
      filterRemove,
      filters,
      modelKey,
      onFilterChange,
      onSearchTerm,
      searchTerm,
      setCurrentView,
      sharedProps,
      t,
    ],
  );

  const pagination = useMemo(
    () => ({
      showSizeChanger: true,
      current: page,
      total: totalCount,
      pageSize: pageSize,
    }),
    [page, pageSize, totalCount],
  );

  const options = useMemo(
    () => ({
      search: true,
      fullScreen: true,
      reload: onItemsReload,
      setting: true,
    }),
    [onItemsReload],
  );

  const toolBarItems: MenuProps["items"] = useMemo(
    () => [
      {
        label: t("Add Filter"),
        key: "filter",
        icon: <Icon icon="filter" />,
      },
      {
        label: t("Add Sort"),
        key: "sort",
        icon: <Icon icon="sortAscending" />,
      },
    ],
    [t],
  );

  const toolBarRender = useCallback(() => {
    return [
      <Dropdown
        {...sharedProps}
        placement="bottom"
        trigger={["click"]}
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
                setCurrentView={setCurrentView}
                onFilterChange={onFilterChange}
                key={Math.random()}
              />
            )
          }
          trigger={["click"]}
          placement="bottom"
          arrow={false}
          open={conditionMenuOpen}
          onOpenChange={handleConditionMenuOpenChange}>
          <Dropdown
            menu={{ items: toolBarItems, onClick: toolBarItemClick }}
            placement="bottom"
            trigger={["click"]}
            arrow={false}
            open={controlMenuOpen}
            onOpenChange={handleControlMenuOpenChange}>
            <Tooltip title={t("Control")}>
              <IconWrapper>
                <Icon icon="control" size={18} />
              </IconWrapper>
            </Tooltip>
          </Dropdown>
        </Dropdown>
      </Dropdown>,
    ];
  }, [
    close,
    conditionMenuOpen,
    controlMenuOpen,
    currentView,
    filters.length,
    handleConditionMenuOpenChange,
    handleControlMenuOpenChange,
    handleOptionsOpenChange,
    onFilterChange,
    optionsOpen,
    selectedFilter,
    setCurrentView,
    sharedProps,
    t,
    toolBarItemClick,
    toolBarItems,
  ]);

  const settingOptions = useMemo(() => {
    const cols: Record<string, ColumnsState> = {};
    currentView.columns?.forEach((col, index) => {
      const colKey = (metaColumn as readonly string[]).includes(col.field.type)
        ? col.field.type
        : (col.field.id ?? "");
      cols[colKey] = { show: col.visible, order: index, fixed: col.fixed };
    });
    return cols;
  }, [currentView.columns]);

  const setSettingOptions = useCallback(
    (options: Record<string, ColumnsState>) => {
      const cols: Column[] = tableColumns
        .filter(
          col =>
            typeof col.key === "string" &&
            col.fieldType !== "EDIT_ICON" &&
            col.fieldType !== "commentsCount",
        )
        .map((col, index) => {
          const colKey = col.key as string;
          const colFieldType = col.fieldType as FieldType;
          return {
            field: {
              type: colFieldType,
              id: colFieldType === "FIELD" || colFieldType === "META_FIELD" ? colKey : undefined,
            },
            visible: options[colKey]?.show ?? true,
            order: options[colKey]?.order ?? index,
            fixed:
              colFieldType === "FIELD" || colFieldType === "META_FIELD"
                ? options[colKey]?.fixed
                : options[colFieldType]?.fixed,
          };
        })
        .sort((a, b) => a.order - b.order)
        .map(col => {
          return {
            field: col.field,
            visible: col.visible,
            fixed: col.fixed,
          };
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
          showSorterTooltip={false}
          options={options}
          loading={loading}
          pagination={pagination}
          toolbar={handleToolbarEvents}
          toolBarRender={toolBarRender}
          dataSource={contentTableFields}
          tableAlertOptionRender={alertOptions}
          rowSelection={rowSelection}
          columns={tableColumns}
          columnsState={{
            value: settingOptions,
            onChange: setSettingOptions,
          }}
          onChange={(pagination, _, sorter) => {
            onContentTableChange(
              pagination.current ?? 1,
              pagination.pageSize ?? 10,
              Array.isArray(sorter)
                ? undefined
                : sorter.order &&
                    sorter.column &&
                    "fieldType" in sorter.column &&
                    typeof sorter.columnKey === "string"
                  ? {
                      field: {
                        id:
                          sorter.column.fieldType === "FIELD" ||
                          sorter.column.fieldType === "META_FIELD"
                            ? sorter.columnKey
                            : undefined,
                        type: sorter.column.fieldType as FieldType,
                      },
                      direction: sorter.order === "ascend" ? "ASC" : "DESC",
                    }
                  : undefined,
            );
          }}
          heightOffset={102}
        />
      ) : null}
      <LinkItemRequestModal
        items={selectedItems.selectedRows}
        onChange={onAddItemToRequest}
        onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
        visible={addItemToRequestModalShown}
        requestList={requests}
        onRequestTableChange={onRequestTableChange}
        requestModalLoading={requestModalLoading}
        requestModalTotalCount={requestModalTotalCount}
        requestModalPage={requestModalPage}
        requestModalPageSize={requestModalPageSize}
        onRequestSearchTerm={onRequestSearchTerm}
        onRequestTableReload={onRequestTableReload}
      />
    </>
  );
};

export default ContentTable;

const StyledButton = styled(Button)`
  padding: 0;
`;

const StyledSearchContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledFilterSpace = styled(Space)`
  gap: 16px;
  overflow-x: auto;
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
  overflow: auto;
  gap: 16px;
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
  box-shadow:
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  .ant-dropdown-menu {
    box-shadow: none;
    overflow-y: auto;
    max-height: 256px;
    max-width: 332px;
    .ant-dropdown-menu-title-content {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;
