import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import ProTable, {
  ProColumns,
  OptionConfig,
  ListToolBarProps,
} from "@reearth-cms/components/atoms/ProTable";
import { ResizableTitle } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";
import type { ResizeCallbackData } from "@reearth-cms/components/molecules/Common/ResizableProTable/resizable";

export type Props = {
  className?: string;
  dataSource?: any[];
  proColumns?: ProColumns<any, "text">[];
  loading: boolean;
  options?: false | OptionConfig | undefined;
  toolbar?: ListToolBarProps | undefined;
};

const ResizableProTable: React.FC<Props> = ({
  dataSource,
  proColumns,
  loading,
  options,
  toolbar,
}) => {
  const [columns, setColumns] = useState<ProColumns<any, "text">[]>([]);

  useEffect(() => {
    if (Array.isArray(proColumns)) {
      setColumns(proColumns);
    }
  }, [proColumns, setColumns]);

  const handleResize =
    (index: number) =>
    (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
      const newColumns = [...columns];
      newColumns[index] = {
        ...newColumns[index],
        width: size.width,
      };
      setColumns(newColumns);
    };

  const mergeColumns: ProColumns<any, "text">[] = columns?.map((col, index) => ({
    ...col,
    onHeaderCell: column => ({
      minWidth: (column as ProColumns<any, "text"> & { minWidth: number }).minWidth,
      width: (column as ProColumns<any, "text">).width,
      onResize: handleResize(index),
    }),
  }));

  return proColumns ? (
    <Wrapper>
      <ProTable
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
        options={options}
        tableStyle={{ overflowX: "scroll" }}
      />
    </Wrapper>
  ) : null;
};

export default ResizableProTable;

const Wrapper = styled.div`
  .ant-table-content {
    width: 1px;
    max-width: 100%;
    table {
      width: 100%;
    }
  }
`;
