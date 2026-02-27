/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ResizeCallbackData } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";

import ProTable, {
  ParamsType,
  ProColumns,
  ProTableProps,
} from "@reearth-cms/components/atoms/ProTable";
import { ResizableTitle } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";

type Props = {
  heightOffset: number;
} & ProTableProps<any | Record<string, any>, ParamsType, "text">;

const ResizableProTable: React.FC<Props> = ({
  columns,
  columnsState,
  dataSource,
  heightOffset,
  loading,
  locale,
  onChange,
  options,
  pagination,
  rowSelection,
  showSorterTooltip,
  tableAlertOptionRender,
  toolbar,
  toolBarRender,
}) => {
  const [resizableColumns, setResizableColumns] = useState<ProColumns<any, "text">[]>(
    columns ?? [],
  );

  useEffect(() => {
    if (columns) {
      setResizableColumns(columns);
    }
  }, [columns, setResizableColumns]);

  const handleResize = useCallback(
    (index: number) =>
      (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
        const newColumns = [...resizableColumns];
        newColumns[index] = {
          ...newColumns[index],
          width: size.width,
        };
        setResizableColumns(newColumns);
      },
    [resizableColumns],
  );

  const mergeColumns: ProColumns<any, "text">[] = useMemo(
    () =>
      resizableColumns?.map((col, index): any => ({
        ...col,
        onHeaderCell: (column: ProColumns<any, "text">) => ({
          minWidth: (column as { minWidth: number } & ProColumns<any, "text">).minWidth,
          onResize: handleResize(index),
          width: (column as ProColumns<any, "text">).width,
        }),
      })),
    [handleResize, resizableColumns],
  );

  const [isRowSelected, setIsRowSelected] = useState(false);

  useEffect(() => {
    if (typeof rowSelection !== "boolean") {
      if (rowSelection?.selectedRowKeys?.length) {
        setIsRowSelected(true);
      } else {
        setIsRowSelected(false);
      }
    }
  }, [rowSelection]);

  return (
    <StyledProTable
      columns={mergeColumns}
      columnsState={columnsState}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
      dataSource={dataSource}
      heightOffset={heightOffset}
      isRowSelected={isRowSelected}
      loading={loading}
      locale={locale}
      onChange={onChange}
      options={options}
      pagination={pagination}
      rowKey="id"
      rowSelection={rowSelection}
      scroll={{ x: "", y: "" }}
      search={false}
      showSorterTooltip={showSorterTooltip}
      tableAlertOptionRender={tableAlertOptionRender}
      toolbar={toolbar}
      toolBarRender={toolBarRender}
    />
  );
};

export default ResizableProTable;

const StyledProTable = styled(ProTable)<{
  heightOffset: number;
  isRowSelected: boolean;
}>`
  height: ${({ heightOffset }) => `calc(100% - ${heightOffset}px)`};
  .ant-pro-card-body {
    padding-bottom: 0;
  }
  .ant-pro-card,
  .ant-pro-card-body,
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table-container {
    height: 100%;
  }
  .ant-table-wrapper {
    height: ${({ isRowSelected }) => `calc(100% - ${isRowSelected ? 128 : 64}px)`};
  }
  .ant-table {
    height: calc(100% - 64px);
  }
  .ant-table-small,
  .ant-table-middle {
    height: calc(100% - 56px);
  }
  .ant-table-body {
    overflow: auto !important;
    height: calc(100% - 47px);
  }
  .ant-pro-table-list-toolbar-container {
    flex-direction: row;
  }
  .ant-pro-table-list-toolbar-left {
    flex: 1;
    max-width: calc(100% - 150px);
    margin: 0;
    .ant-pro-table-list-toolbar-search {
      width: 100%;
    }
    .ant-input-group-wrapper {
      min-width: 200px;
      max-width: 230px;
    }
  }
  .ant-pro-table-list-toolbar-right {
    flex: inherit;
  }
`;
