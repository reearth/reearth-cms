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
  },
) => {
  const { onResize, width, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
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
      />
    </Wrapper>
  ) : null;
};

export default ContentTable;

const Wrapper = styled.div`
  width: 0;
  min-width: 100%;
  overflow-x: scroll;
  table {
    min-width: 48px;
  }
`;
