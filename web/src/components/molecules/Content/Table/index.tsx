import { Dispatch, SetStateAction } from "react";

import { ExtendedColumns } from "@reearth-cms/components/molecules/Content/Table/types";
import { ContentTableField, Item } from "@reearth-cms/components/molecules/Content/types";
import { Request } from "@reearth-cms/components/molecules/Request/types";
import {
  ItemSort,
  FieldType,
  AndConditionInput,
} from "@reearth-cms/components/molecules/View/types";
import { Workspace } from "@reearth-cms/components/molecules/Workspace/types";
import { CurrentViewType } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";

import ResizableProTable from "../../Common/ResizableProTable";
import LinkItemRequestModal from "../LinkItemRequestModal/LinkItemRequestModal";

import useHooks from "./hooks";

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ExtendedColumns[];
  currentWorkspace?: Workspace;
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
  onFilterChange: (filter?: AndConditionInput) => void;
  onContentTableChange: (page: number, pageSize: number, sorter?: ItemSort) => void;
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
  modelKey?: string;
  onRequestSearchTerm: (term: string) => void;
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  currentWorkspace,
  loading,
  selectedItem,
  selection,
  totalCount,
  currentView,
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
  onFilterChange,
  onContentTableChange,
  onItemSelect,
  setSelection,
  onItemDelete,
  onItemsReload,
  modelKey,
  onRequestSearchTerm,
}) => {
  const {
    tableColumns,
    AlertOptions,
    rowSelection,
    pagination,
    toolBarRender,
    handleToolbarEvents,
    settingOptions,
    setSettingOptions,
    options,
  } = useHooks(
    contentTableColumns,
    currentWorkspace,
    loading,
    selectedItem,
    selection,
    totalCount,
    currentView,
    setCurrentView,
    page,
    pageSize,
    requestModalLoading,
    requestModalTotalCount,
    requestModalPage,
    requestModalPageSize,
    onRequestTableChange,
    onSearchTerm,
    onFilterChange,
    onContentTableChange,
    onItemSelect,
    setSelection,
    onItemDelete,
    onUnpublish,
    onItemsReload,
    requests,
    addItemToRequestModalShown,
    onAddItemToRequest,
    onAddItemToRequestModalClose,
    onAddItemToRequestModalOpen,
    modelKey,
    onRequestSearchTerm,
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
          tableAlertOptionRender={AlertOptions}
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
          onRequestSearchTerm={onRequestSearchTerm}
        />
      )}
    </>
  );
};

export default ContentTable;
