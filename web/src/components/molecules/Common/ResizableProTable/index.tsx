/* eslint-disable @typescript-eslint/no-explicit-any */
import styled from "@emotion/styled";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";

import ProTable, {
  ProColumns,
  ProTableProps,
  ParamsType,
} from "@reearth-cms/components/atoms/ProTable";
import { ResizableTitle } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";
import type { ResizeCallbackData } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";
import { Constant } from "@reearth-cms/utils/constant";

type Props = ProTableProps<Record<string, any> | any, ParamsType, "text"> & {
  heightOffset: number;
};

const tableComponents = {
  header: {
    cell: ResizableTitle,
  },
};

const tableScroll = { x: "", y: "" };

const ResizableProTable = forwardRef<HTMLDivElement, Props>(
  (
    {
      dataSource,
      columns,
      loading,
      options,
      toolbar,
      toolBarRender,
      rowSelection,
      tableAlertOptionRender,
      pagination,
      onChange,
      columnsState,
      showSorterTooltip,
      heightOffset,
      locale,
    },
    ref,
  ) => {
    const [resizableColumns, setResizableColumns] = useState<ProColumns<any, "text">[]>(
      columns ?? [],
    );

    useEffect(() => {
      if (columns) {
        setResizableColumns(columns);
      }
    }, [columns]);

    const handleResize = useCallback(
      (index: number) =>
        (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
          setResizableColumns(prev => {
            const newColumns = [...prev];
            newColumns[index] = {
              ...newColumns[index],
              width: size.width,
            };
            return newColumns;
          });
        },
      [],
    );

    const mergeColumns = useMemo<ProColumns<any, "text">[]>(
      () =>
        resizableColumns?.map((col, index): any => ({
          ...col,
          onHeaderCell: (column: ProColumns<any, "text">) => ({
            minWidth: (column as ProColumns<any, "text"> & { minWidth: number }).minWidth,
            width: (column as ProColumns<any, "text">).width,
            onResize: handleResize(index),
          }),
        })),
      [handleResize, resizableColumns],
    );

    const isRowSelected = useMemo<boolean>(() => {
      if (typeof rowSelection === "boolean") return false;
      return !!rowSelection?.selectedRowKeys?.length;
    }, [rowSelection]);

    return (
      <Wrapper ref={ref} $isRowSelected={isRowSelected} $heightOffset={heightOffset}>
        <ProTable
          dataSource={dataSource}
          columns={mergeColumns}
          components={tableComponents}
          rowKey="id"
          search={false}
          loading={loading}
          toolbar={toolbar}
          toolBarRender={toolBarRender}
          options={options}
          tableAlertOptionRender={tableAlertOptionRender}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={onChange}
          columnsState={columnsState}
          showSorterTooltip={showSorterTooltip}
          scroll={tableScroll}
          locale={locale}
        />
      </Wrapper>
    );
  },
);

export default ResizableProTable;

const Wrapper = styled("div", Constant.TRANSIENT_OPTIONS)<{
  $isRowSelected: boolean;
  $heightOffset: number;
}>`
  height: ${({ $heightOffset }) => `calc(100% - ${$heightOffset}px)`};
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
    height: ${({ $isRowSelected }) => `calc(100% - ${$isRowSelected ? 128 : 64}px)`};
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
