import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import ProTable, {
  ProColumns,
  ProTableProps,
  ParamsType,
} from "@reearth-cms/components/atoms/ProTable";
import { ResizableTitle } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";
import type { ResizeCallbackData } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";

export type Props = ProTableProps<Record<string, any> | any, ParamsType, "text">;

const ResizableProTable: React.FC<Props> = ({
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
}) => {
  const [resizableColumns, setResizableColumns] = useState<ProColumns<any, "text">[]>([]);

  useEffect(() => {
    if (columns) {
      setResizableColumns(columns);
    }
  }, [columns, setResizableColumns]);

  const handleResize =
    (index: number) =>
    (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
      const newColumns = [...resizableColumns];
      newColumns[index] = {
        ...newColumns[index],
        width: size.width,
      };
      setResizableColumns(newColumns);
    };

  const mergeColumns: ProColumns<any, "text">[] = resizableColumns?.map((col, index): any => ({
    ...col,
    onHeaderCell: (column: ProColumns<any, "text">) => ({
      minWidth: (column as ProColumns<any, "text"> & { minWidth: number }).minWidth,
      width: (column as ProColumns<any, "text">).width,
      onResize: handleResize(index),
    }),
  }));

  return (
    <StyledProTable
      dataSource={dataSource}
      columns={mergeColumns}
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
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
      scroll={{ x: "", y: "" }}
    />
  );
};

export default ResizableProTable;

const StyledProTable = styled(ProTable)`
  height: calc(100% - 102px);
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
    height: calc(100% - 64px);
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
`;
