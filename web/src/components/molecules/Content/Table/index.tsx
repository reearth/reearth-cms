import styled from "@emotion/styled";
import React, {
  Dispatch,
  Key,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Button from "@reearth-cms/components/atoms/Button";
import CustomTag from "@reearth-cms/components/atoms/CustomTag";
import Dropdown, { MenuProps } from "@reearth-cms/components/atoms/Dropdown";
import Empty from "@reearth-cms/components/atoms/Empty";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import { useModal } from "@reearth-cms/components/atoms/Modal";
import {
  ColumnsState,
  ListToolBarProps,
  TableRowSelection,
} from "@reearth-cms/components/atoms/ProTable";
import Search from "@reearth-cms/components/atoms/Search";
import Space from "@reearth-cms/components/atoms/Space";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
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
  Column,
  ConditionInput,
  CurrentView,
  FieldType,
  ItemSort,
  metaColumn,
} from "@reearth-cms/components/molecules/View/types";
import { Trans, useT } from "@reearth-cms/i18n";
import { useWorkspace } from "@reearth-cms/state";
import { dateTimeFormat } from "@reearth-cms/utils/format";
import { ImportContentUtils } from "@reearth-cms/utils/importContent";

import DropdownRender from "./DropdownRender";
import FilterDropdown from "./filterDropdown";

export type Props = {
  addItemToRequestModalShown: boolean;
  contentTableColumns?: ExtendedColumns[];
  contentTableFields?: ContentTableField[];
  currentView: CurrentView;
  deleteLoading: boolean;
  hasCreateRight: boolean;
  hasDeleteRight: boolean;
  hasModelFields: boolean;
  hasPublishRight: boolean;
  hasRequestUpdateRight: boolean;
  loading: boolean;
  modelKey?: string;
  onAddItemToRequest: (request: Request, items: RequestItem[]) => Promise<void>;
  onAddItemToRequestModalClose: () => void;
  onAddItemToRequestModalOpen: () => void;
  onContentTableChange: (page: number, pageSize: number, sorter?: ItemSort) => void;
  onFilterChange: (filter?: ConditionInput[]) => void;
  onImportModalOpen: () => void;
  onItemDelete: (itemIds: string[]) => Promise<void>;
  onItemEdit: (itemId: string) => void;
  onItemSelect: (itemId: string) => void;
  onItemsReload: () => void;
  onPublish: (itemIds: string[]) => Promise<void>;
  onRequestSearchTerm: (term: string) => void;
  onRequestTableChange: (page: number, pageSize: number) => void;
  onRequestTableReload: () => void;
  onSearchTerm: (term?: string) => void;
  onSelect: (selectedRowKeys: Key[], selectedRows: ContentTableField[]) => void;
  onUnpublish: (itemIds: string[]) => Promise<void>;
  page: number;
  pageSize: number;
  publishLoading: boolean;
  requestModalLoading: boolean;
  requestModalPage: number;
  requestModalPageSize: number;
  requestModalTotalCount: number;
  requests: Request[];
  searchTerm: string;
  selectedItem?: Item;
  selectedItems: { selectedRows: { itemId: string; version?: string }[] };
  setCurrentView: Dispatch<SetStateAction<CurrentView>>;
  showPublishAction: boolean;
  totalCount: number;
  unpublishLoading: boolean;
};

const ContentTable: React.FC<Props> = ({
  addItemToRequestModalShown,
  contentTableColumns,
  contentTableFields,
  currentView,
  deleteLoading,
  hasCreateRight,
  hasDeleteRight,
  hasModelFields,
  hasPublishRight,
  hasRequestUpdateRight,
  loading,
  modelKey,
  onAddItemToRequest,
  onAddItemToRequestModalClose,
  onAddItemToRequestModalOpen,
  onContentTableChange,
  onFilterChange,
  onImportModalOpen,
  onItemDelete,
  onItemEdit,
  onItemSelect,
  onItemsReload,
  onPublish,
  onRequestSearchTerm,
  onRequestTableChange,
  onRequestTableReload,
  onSearchTerm,
  onSelect,
  onUnpublish,
  page,
  pageSize,
  publishLoading,
  requestModalLoading,
  requestModalPage,
  requestModalPageSize,
  requestModalTotalCount,
  requests,
  searchTerm,
  selectedItem,
  selectedItems,
  setCurrentView,
  showPublishAction,
  totalCount,
  unpublishLoading,
}) => {
  const [currentWorkspace] = useWorkspace();
  const t = useT();
  const { confirm } = useModal();

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
        align: "center",
        dataIndex: "editIcon",
        ellipsis: true,
        fieldType: "EDIT_ICON",
        hideInSetting: true,
        key: "EDIT_ICON",
        minWidth: 48,
        render: (_, contentField) => (
          <Icon color={"#1890ff"} icon="edit" onClick={() => onItemEdit(contentField.id)} />
        ),
        title: "",
        width: 48,
      },
      {
        align: "center",
        dataIndex: "commentsCount",
        fieldType: "commentsCount",
        hideInSetting: true,
        key: "commentsCount",
        minWidth: 48,
        render: (_, item) => {
          return (
            <StyledButton onClick={() => onItemSelect(item.id)} type="link">
              <CustomTag
                color={item.id === selectedItem?.id ? "#87e8de" : undefined}
                value={item.comments?.length || 0}
              />
            </StyledButton>
          );
        },
        title: () => <Icon icon="message" />,
        width: 48,
      },
      {
        dataIndex: "Status",
        fieldType: "STATUS",
        key: "STATUS",
        minWidth: 148,
        render: (_, item) => <Status status={item.status} />,
        title: t("Status"),
        width: 148,
      },
    ],
    [t, onItemEdit, selectedItem?.id, onItemSelect],
  );

  const systemMetaDataColumns: ExtendedColumns[] = useMemo(
    () => [
      {
        dataIndex: "createdAt",
        defaultSortOrder: sortOrderGet("CREATION_DATE"),
        ellipsis: true,
        fieldType: "CREATION_DATE",
        key: "CREATION_DATE",
        minWidth: 148,
        render: (_, item) => dateTimeFormat(item.createdAt),
        sorter: true,
        sortOrder: sortOrderGet("CREATION_DATE"),
        title: t("Created At"),
        type: "Date",
        width: 148,
      },
      {
        dataIndex: "createdBy",
        defaultSortOrder: sortOrderGet("CREATION_USER"),
        ellipsis: true,
        fieldType: "CREATION_USER",
        key: "CREATION_USER",
        minWidth: 148,
        render: (_, item) => item.createdBy.name,
        sorter: true,
        sortOrder: sortOrderGet("CREATION_USER"),
        title: t("Created By"),
        type: "Person",
        width: 148,
      },
      {
        dataIndex: "updatedAt",
        defaultSortOrder: sortOrderGet("MODIFICATION_DATE"),
        ellipsis: true,
        fieldType: "MODIFICATION_DATE",
        key: "MODIFICATION_DATE",
        minWidth: 148,
        render: (_, item) => dateTimeFormat(item.updatedAt),
        sorter: true,
        sortOrder: sortOrderGet("MODIFICATION_DATE"),
        title: t("Updated At"),
        type: "Date",
        width: 148,
      },
      {
        dataIndex: "updatedBy",
        defaultSortOrder: sortOrderGet("MODIFICATION_USER"),
        ellipsis: true,
        fieldType: "MODIFICATION_USER",
        key: "MODIFICATION_USER",
        minWidth: 148,
        render: (_, item) => (item.updatedBy ? item.updatedBy : "-"),
        sorter: true,
        sortOrder: sortOrderGet("MODIFICATION_USER"),
        title: t("Updated By"),
        type: "Person",
        width: 148,
      },
    ],
    [t, sortOrderGet],
  );

  const tableColumns = useMemo(() => {
    return contentTableColumns
      ? [...actionsColumns, ...contentTableColumns, ...systemMetaDataColumns]
      : [...actionsColumns];
  }, [actionsColumns, contentTableColumns, systemMetaDataColumns]);

  const rowSelection: TableRowSelection = useMemo(
    () => ({
      onChange: onSelect,
      selectedRowKeys: selectedItems.selectedRows.map(item => item.itemId),
    }),
    [onSelect, selectedItems.selectedRows],
  );

  const publishConfirm = useCallback(
    (itemIds: string[]) => {
      confirm({
        cancelText: t("No"),
        content: t("All selected items will be published. You can unpublish them anytime."),
        okText: t("Yes"),
        async onOk() {
          await onPublish(itemIds);
        },
        title: t("Publish items"),
      });
    },
    [confirm, onPublish, t],
  );

  const alertOptions = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      return (
        <Space size={4}>
          <Button
            disabled={!hasPublishRight || !showPublishAction}
            icon={<Icon icon="upload" />}
            loading={publishLoading}
            onClick={() => {
              publishConfirm(props.selectedRowKeys);
            }}
            size="small"
            type="link">
            {t("Publish")}
          </Button>
          <Button
            disabled={!hasRequestUpdateRight}
            icon={<Icon icon="plus" />}
            onClick={() => onAddItemToRequestModalOpen()}
            size="small"
            type="link">
            {t("Add to Request")}
          </Button>
          <Button
            disabled={!hasPublishRight}
            icon={<Icon icon="eyeInvisible" />}
            loading={unpublishLoading}
            onClick={() => onUnpublish(props.selectedRowKeys)}
            size="small"
            type="link">
            {t("Unpublish")}
          </Button>
          <Button
            danger
            disabled={!hasDeleteRight}
            icon={<Icon icon="delete" />}
            loading={deleteLoading}
            onClick={() => onItemDelete(props.selectedRowKeys)}
            size="small"
            type="link">
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
        const { fieldId, operator } = condition;
        const value = "value" in condition ? (condition.value as string) : "";
        const operatorType = Object.keys(c)[0];
        const columns =
          fieldId.type === "FIELD" || fieldId.type === "META_FIELD"
            ? contentTableColumns
            : actionsColumns;
        const column = columns.find(c => c.key === fieldId.id);
        if (column) {
          const { dataIndex, key, multiple, required, title, type, typeProperty } = column;
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
              id: key as string,
              members,
              multiple,
              required,
              title: title as string,
              type,
              typeProperty,
            });
            newDefaultValues.push({ operator, operatorType, value });
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
        const { dataIndex, key, multiple, required, title, type, typeProperty } = column;
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
            id: key as string,
            members,
            multiple,
            required,
            title: title as string,
            type,
            typeProperty,
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
      arrow: false,
      dropdownRender: (menu: React.ReactNode) => (
        <Wrapper>
          <InputWrapper>
            <Input
              onChange={handleChange}
              placeholder={isFilter.current ? "Filter by..." : "Sort by..."}
              value={inputValue}
            />
          </InputWrapper>
          {React.cloneElement(menu as React.ReactElement)}
        </Wrapper>
      ),
      menu: { items },
    }),
    [handleChange, inputValue, items],
  );

  const handleToolbarEvents: ListToolBarProps = useMemo(
    () => ({
      search: (
        <StyledSearchContainer>
          <Search
            allowClear
            defaultValue={searchTerm}
            key={`${modelKey}${currentView.id}`}
            onSearch={(value: string) => {
              onSearchTerm(value);
            }}
            placeholder={t("input search text")}
          />
          <StyledFilterWrapper>
            <StyledFilterSpace size={[0, 8]}>
              {filters.map((filter, index) => (
                <FilterDropdown
                  currentView={currentView}
                  defaultValue={defaultFilterValues.current[index]}
                  filter={filter}
                  filterRemove={filterRemove}
                  index={index}
                  isFilterOpen={isFilterOpen.current}
                  key={index}
                  onFilterChange={onFilterChange}
                  setCurrentView={setCurrentView}
                />
              ))}
            </StyledFilterSpace>
            <Dropdown
              {...sharedProps}
              onOpenChange={() => {
                isFilter.current = true;
                setInputValue("");
                setItems(defaultItems);
              }}
              placement="bottomLeft"
              trigger={["click"]}>
              <StyledFilterButton icon={<Icon icon="plus" />} type="text">
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
      current: page,
      pageSize: pageSize,
      showSizeChanger: true,
      total: totalCount,
    }),
    [page, pageSize, totalCount],
  );

  const options = useMemo(
    () => ({
      fullScreen: true,
      reload: onItemsReload,
      search: true,
      setting: true,
    }),
    [onItemsReload],
  );

  const toolBarItems: MenuProps["items"] = useMemo(
    () => [
      {
        icon: <Icon icon="filter" />,
        key: "filter",
        label: t("Add Filter"),
      },
      {
        icon: <Icon icon="sortAscending" />,
        key: "sort",
        label: t("Add Sort"),
      },
    ],
    [t],
  );

  const toolBarRender = useCallback(() => {
    return [
      <Dropdown
        {...sharedProps}
        key="control"
        onOpenChange={handleOptionsOpenChange}
        open={optionsOpen}
        placement="bottom"
        trigger={["click"]}>
        <Dropdown
          arrow={false}
          dropdownRender={() =>
            selectedFilter && (
              <DropdownRender
                close={close}
                currentView={currentView}
                filter={selectedFilter}
                index={filters.length - 1}
                isFilter={isFilter.current}
                key={Math.random()}
                onFilterChange={onFilterChange}
                open={conditionMenuOpen}
                setCurrentView={setCurrentView}
              />
            )
          }
          onOpenChange={handleConditionMenuOpenChange}
          open={conditionMenuOpen}
          placement="bottom"
          trigger={["click"]}>
          <Dropdown
            arrow={false}
            menu={{ items: toolBarItems, onClick: toolBarItemClick }}
            onOpenChange={handleControlMenuOpenChange}
            open={controlMenuOpen}
            placement="bottom"
            trigger={["click"]}>
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
      cols[colKey] = { fixed: col.fixed, order: index, show: col.visible };
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
              id: colFieldType === "FIELD" || colFieldType === "META_FIELD" ? colKey : undefined,
              type: colFieldType,
            },
            fixed:
              colFieldType === "FIELD" || colFieldType === "META_FIELD"
                ? options[colKey]?.fixed
                : options[colFieldType]?.fixed,
            order: options[colKey]?.order ?? index,
            visible: options[colKey]?.show ?? true,
          };
        })
        .sort((a, b) => a.order - b.order)
        .map(col => {
          return {
            field: col.field,
            fixed: col.fixed,
            visible: col.visible,
          };
        });

      setCurrentView(prev => ({
        ...prev,
        columns: cols,
      }));
    },
    [setCurrentView, tableColumns],
  );

  const getImportContentUIMetadata = useMemo(
    () =>
      ImportContentUtils.getUIMetadata({ hasContentCreateRight: hasCreateRight, hasModelFields }),
    [hasCreateRight, hasModelFields],
  );

  return (
    <>
      {contentTableColumns ? (
        <ResizableProTable
          columns={tableColumns}
          columnsState={{
            onChange: setSettingOptions,
            value: settingOptions,
          }}
          dataSource={contentTableFields}
          heightOffset={102}
          loading={loading}
          locale={{
            emptyText: (
              <Empty description={t("No Content Data")} image={Empty.PRESENTED_IMAGE_SIMPLE}>
                {!getImportContentUIMetadata.shouldDisable && (
                  <Trans
                    components={{
                      l: (
                        <ImportButton onClick={onImportModalOpen} type="link">
                          import
                        </ImportButton>
                      ),
                    }}
                    i18nKey="Please add some items manually or import from JSON/GeoJSON/CSV"
                  />
                )}
              </Empty>
            ),
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
                      direction: sorter.order === "ascend" ? "ASC" : "DESC",
                      field: {
                        id:
                          sorter.column.fieldType === "FIELD" ||
                          sorter.column.fieldType === "META_FIELD"
                            ? sorter.columnKey
                            : undefined,
                        type: sorter.column.fieldType as FieldType,
                      },
                    }
                  : undefined,
            );
          }}
          options={options}
          pagination={pagination}
          rowSelection={rowSelection}
          showSorterTooltip={false}
          tableAlertOptionRender={alertOptions}
          toolbar={handleToolbarEvents}
          toolBarRender={toolBarRender}
        />
      ) : null}
      <LinkItemRequestModal
        items={selectedItems.selectedRows}
        onChange={onAddItemToRequest}
        onLinkItemRequestModalCancel={onAddItemToRequestModalClose}
        onRequestSearchTerm={onRequestSearchTerm}
        onRequestTableChange={onRequestTableChange}
        onRequestTableReload={onRequestTableReload}
        requestList={requests}
        requestModalLoading={requestModalLoading}
        requestModalPage={requestModalPage}
        requestModalPageSize={requestModalPageSize}
        requestModalTotalCount={requestModalTotalCount}
        visible={addItemToRequestModalShown}
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

const ImportButton = styled(Button)`
  padding: 0;
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
