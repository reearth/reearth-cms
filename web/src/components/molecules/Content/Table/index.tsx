import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";
import type { ResizeCallbackData } from "react-resizable";
import { Resizable } from "react-resizable";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ProTable, { ListToolBarProps, ProColumns } from "@reearth-cms/components/atoms/ProTable";
import { ContentTableField } from "@reearth-cms/components/molecules/Content/types";

export type Props = {
  className?: string;
  contentTableFields?: ContentTableField[];
  contentTableColumns?: ProColumns<ContentTableField>[];
  loading: boolean;
  onItemEdit: (itemId: string) => void;
  onItemsReload: () => void;
};

const ResizableTitle = (
  props: React.HTMLAttributes<any> & {
    onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void;
    width: number;
    minWidth: number;
  },
) => {
  const { onResize, width, minWidth, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      minConstraints={[minWidth, 0]}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}>
      <th {...restProps} />
    </Resizable>
  );
};

const ContentTable: React.FC<Props> = ({
  contentTableFields,
  contentTableColumns,
  loading,
  onItemEdit,
  onItemsReload,
}) => {
  const actionsColumn: ProColumns<ContentTableField> = useMemo(
    () => ({
      render: (_, contentField) => (
        <Button
          type="link"
          icon={<Icon icon="edit" />}
          onClick={() => onItemEdit(contentField.id)}
        />
      ),
      width: 48,
      minWidth: 48,
    }),
    [onItemEdit],
  );

  const [columns, setColumns] = useState<ProColumns<ContentTableField>[]>([actionsColumn]);
  const handleToolbarEvents: ListToolBarProps | undefined = {
    search: {
      onSearch: _ => {},
    },
  };

  useEffect(() => {
    if (Array.isArray(contentTableColumns)) {
      setColumns([actionsColumn, ...contentTableColumns]);
    }
  }, [contentTableColumns, actionsColumn, setColumns, onItemEdit]);

  const options = {
    fullScreen: true,
    reload: onItemsReload,
    setting: true,
  };

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

  const mergeColumns: ProColumns<ContentTableField>[] = columns?.map((col, index) => ({
    ...col,
    onHeaderCell: column => ({
      minWidth: (column as ProColumns<ContentTableField> & { minWidth: number }).minWidth,
      width: (column as ProColumns<ContentTableField>).width,
      onResize: handleResize(index),
    }),
  }));

  return contentTableColumns ? (
    <Wrapper>
      <ProTable
        dataSource={contentTableFields}
        columns={mergeColumns}
        components={{
          header: {
            cell: ResizableTitle,
          },
        }}
        search={false}
        rowKey="id"
        loading={loading}
        toolbar={handleToolbarEvents}
        options={options}
        tableStyle={{ overflowX: "scroll" }}
      />
    </Wrapper>
  ) : null;
};

export default ContentTable;

const Wrapper = styled.div`
  .ant-table-content {
    width: 1px;
    max-width: 100%;
    table {
      width: 100%;
    }
  }
`;
